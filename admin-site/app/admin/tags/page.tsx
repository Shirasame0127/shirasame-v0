"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Plus, Trash2, Tag, Edit, LinkIcon, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import Link from "next/link"
import { db } from "@/lib/db/storage"
import { DndContext, closestCenter, PointerSensor, TouchSensor, MouseSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import apiFetch from '@/lib/api-client'
import { getCurrentUser } from "@/lib/auth"

export default function AdminTagsPage() {
  const SPECIAL_LINK_GROUP_NAME = "リンク先"
  const PRODUCT_TYPE_GROUP_NAME = "product-type"
  const [tags, setTags] = useState<Array<{ id: string; name: string; group?: string; linkUrl?: string; linkLabel?: string }>>([])
  const [serverGroups, setServerGroups] = useState<string[]>([])
  const [serverGroupMeta, setServerGroupMeta] = useState<Record<string, { label?: string; isImmutable?: boolean; visibleWhenTriggerTagIds?: string[] }>>({})
  const [newTagName, setNewTagName] = useState("")
  const [newTagGroup, setNewTagGroup] = useState("")
  const [newTagLinkUrl, setNewTagLinkUrl] = useState("")
  const [newTagLinkLabel, setNewTagLinkLabel] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false)
  const [editingGroupName, setEditingGroupName] = useState("")
  const [newGroupName, setNewGroupName] = useState("")
  const [selectedVisibility, setSelectedVisibility] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    ;(async () => {
      try {
        const [tagsRes, groupsRes] = await Promise.all([
          apiFetch("/api/tags"),
          apiFetch("/api/tag-groups"),
        ])

        const tagsJson = await tagsRes.json().catch(() => ({ data: [] }))
        const groupsJson = await groupsRes.json().catch(() => ({ data: [] }))

        const serverTags = Array.isArray(tagsJson) ? tagsJson : tagsJson.data || []
        const tagGroups = Array.isArray(groupsJson) ? groupsJson : groupsJson.data || []

        const storedTags = db.tags.getAllWithPlaceholders()
        // prefer non-empty server response; otherwise fall back to local cache
        if (tagsRes.ok && Array.isArray(serverTags) && serverTags.length > 0) {
          setTags(serverTags)
        } else if (storedTags && storedTags.length > 0) {
          setTags(storedTags)
        } else {
          // last resort: set whatever server returned (possibly empty)
          setTags(serverTags)
        }

        if (groupsRes.ok) {
          const groupNames = tagGroups.map((g: any) => g.name).filter(Boolean)
          const meta: Record<string, any> = {}
            ;(tagGroups || []).forEach((g: any) => {
              if (!g || !g.name) return
              meta[g.name] = { label: g.label || g.name, isImmutable: !!g.is_immutable, visibleWhenTriggerTagIds: Array.isArray(g.visibleWhenTriggerTagIds) ? g.visibleWhenTriggerTagIds : [] }
            })
          setServerGroupMeta(meta)
          // Ensure the special LINK group exists in server-side groups. If missing, try to create it.
          if (!groupNames.includes(SPECIAL_LINK_GROUP_NAME)) {
            try {
              await apiFetch('/api/admin/tag-groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: SPECIAL_LINK_GROUP_NAME, label: SPECIAL_LINK_GROUP_NAME }),
              })
              // add to the local list so UI shows it immediately
              groupNames.push(SPECIAL_LINK_GROUP_NAME)
            } catch (e) {
              console.warn('failed to ensure special link group exists', e)
            }
          }
          setServerGroups(groupNames)
        } else {
          // try to infer groups from local tags
          const localGroups = Array.from(new Set((storedTags || []).map((t: any) => t.group).filter(Boolean)))
          setServerGroups(localGroups as string[])
        }
      } catch (e) {
        const storedTags = db.tags.getAllWithPlaceholders()
        setTags(storedTags)
        console.warn("failed to load tags from server, falling back to cache", e)
      }
    })()
  }, [])

  const usedTags = useMemo(() => {
    const tagCounts = new Map<string, number>()
    const currentUser = getCurrentUser && getCurrentUser()
    const uid = currentUser?.id || undefined
    const products = db.products.getAll(uid)
    products.forEach((product) => {
      (product.tags || []).forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    })
    return tagCounts
  }, [])

  const groupedTags = useMemo(() => {
    const groups = new Map<string, typeof tags>()
    tags.forEach((tag) => {
      if (tag.name?.startsWith('__GROUP_PLACEHOLDER__')) return
      
      const groupName = tag.group || "未分類"
      if (!groups.has(groupName)) {
        groups.set(groupName, [])
      }
      groups.get(groupName)!.push(tag)
    })
    return groups
  }, [tags, serverGroups])

  const allGroupNames = useMemo(() => {
    const names = new Set<string>()
    tags.forEach((tag) => {
      if (tag.group && tag.group !== "未分類") {
        names.add(tag.group)
      }
    })
    // include server-side groups even if they have no tags yet
    serverGroups.forEach((g) => names.add(g))
    return Array.from(names).sort()
  }, [tags])

  // move group up/down (index-based)
  const moveGroup = async (groupName: string, direction: "up" | "down") => {
    const arr = Array.from(allGroupNames)
    const idx = arr.indexOf(groupName)
    if (idx === -1) return
    const target = direction === "up" ? idx - 1 : idx + 1
    if (target < 0 || target >= arr.length) return
    const newArr = arr.slice()
    const tmp = newArr[target]
    newArr[target] = newArr[idx]
    newArr[idx] = tmp

    // persist order to server
    try {
      const groupsPayload = newArr.map((name, i) => ({ name, order: i }))
      const res = await apiFetch('/api/admin/tag-groups/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groups: groupsPayload }),
      })
      if (!res.ok) throw new Error('reorder failed')
      setServerGroups(newArr)
    } catch (e) {
      console.error('moveGroup failed', e)
      toast({ variant: 'destructive', title: '並び替え失敗' })
    }
  }

  // ----- Drag-and-drop (グループ単位) -----
  function SortableGroup({ id, children }: any) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      touchAction: 'none' as const,
      userSelect: 'none' as const,
    }

    return (
      <div
        ref={setNodeRef as any}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-background rounded-md border p-3 flex items-center min-w-0 w-full"
      >
        {/* children are expected to include a left (name) and right (actions) element */}
        {children}
      </div>
    )
  }

  // empty group droppable placeholder
  function SortablePlaceholder({ id, groupName }: any) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      touchAction: 'none' as const,
      userSelect: 'none' as const,
    }

    return (
      <div ref={setNodeRef as any} style={style} className="bg-background rounded-md border p-3 min-w-40 min-h-11 flex items-center justify-center text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="text-sm whitespace-nowrap">ドロップしてタグを追加</div>
        </div>
        <div {...attributes} {...listeners} className="sr-only" />
      </div>
    )
  }

  async function handleGroupMove(activeId: string, overId: string) {
    if (!overId || activeId === overId) return

    const arr = serverGroups.slice()
    const fromIdx = arr.indexOf(activeId)
    const toIdx = arr.indexOf(overId)
    if (fromIdx === -1 || toIdx === -1) return

    const newArr = arr.slice()
    const [moved] = newArr.splice(fromIdx, 1)
    newArr.splice(toIdx, 0, moved)

    const prev = serverGroups.slice()
    setServerGroups(newArr)

    try {
      const groupsPayload = newArr.map((name, i) => ({ name, order: i }))
      const res = await apiFetch('/api/admin/tag-groups/reorder', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ groups: groupsPayload })
      })
      if (!res.ok) throw new Error('reorder failed')

      // refresh authoritative groups from server
      const fresh = await apiFetch('/api/tag-groups')
      if (fresh.ok) {
        const freshJson = await fresh.json().catch(() => ({ data: [] }))
        const freshGroups = Array.isArray(freshJson) ? freshJson : freshJson.data || []
        setServerGroups(freshGroups.map((g: any) => g.name))
      }
    } catch (e) {
      console.error('group reorder failed', e)
      setServerGroups(prev)
      toast({ variant: 'destructive', title: 'グループの並び替えに失敗しました' })
    }
  }

  // move tag up/down within its group
  const moveTag = async (tagId: string, groupName: string, direction: "up" | "down") => {
    const groupTags = tags.filter((t) => (t.group || '未分類') === groupName && !t.name?.startsWith('__GROUP_PLACEHOLDER__'))
    const idx = groupTags.findIndex((t) => t.id === tagId)
    if (idx === -1) return
    const target = direction === 'up' ? idx - 1 : idx + 1
    if (target < 0 || target >= groupTags.length) return

    // construct new tags ordering for this group
    const newOrder = groupTags.slice()
    const tmp = newOrder[target]
    newOrder[target] = newOrder[idx]
    newOrder[idx] = tmp

    // update local tags array ordering by adjusting sort_order and persisting
    const updatedTags = tags.map((t) => {
      const found = newOrder.findIndex((nt) => nt.id === t.id)
      if (found !== -1) {
        return { ...t, sortOrder: found }
      }
      return t
    })

    try {
      const tagsPayload = newOrder.map((t, i) => ({ id: t.id, order: i, group: groupName }))
      const res = await apiFetch('/api/admin/tags/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: tagsPayload }),
      })
      if (!res.ok) throw new Error('tags reorder failed')

      // refresh authoritative tags from server
      const fresh = await apiFetch('/api/tags')
      if (!fresh.ok) throw new Error('failed to fetch tags')
      const freshJson = await fresh.json().catch(() => ({ data: [] }))
      const freshTags = Array.isArray(freshJson) ? freshJson : freshJson.data || []
      setTags(freshTags)
      db.tags.saveAll(freshTags)
    } catch (e) {
      console.error('moveTag failed', e)
      // fallback: apply ordering locally so UI remains responsive
      setTags(updatedTags)
      db.tags.saveAll(updatedTags)
      toast({ variant: 'destructive', title: '並び替えはローカル保存されました（サーバ同期失敗）' })
    }
  }

  const addTag = () => {
    const trimmedName = newTagName.trim()
    if (!trimmedName) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "タグ名を入力してください"
      })
      return
    }
    
    if (tags.some(t => t.name === trimmedName)) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "同じ名前のタグが既に存在します"
      })
      return
    }

    if (newTagLinkUrl.trim() && !newTagLinkLabel.trim()) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "リンク先URLを指定する場合は、リンクボタンのテキストも入力してください"
      })
      return
    }

    // If adding a tag into the special link group, require a link label
    if (newTagGroup === SPECIAL_LINK_GROUP_NAME && !newTagLinkLabel.trim()) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "リンク先グループに追加する場合は、リンクボタンのテキストを必ず入力してください"
      })
      return
    }

    const newTag = {
      id: `tag-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      name: trimmedName,
      group: newTagGroup.trim() && newTagGroup !== "__uncategorized__" ? newTagGroup : undefined,
      linkUrl: newTagLinkUrl.trim() || undefined,
      linkLabel: newTagLinkLabel.trim() || undefined,
    }

    ;(async () => {
      try {
        // Use single-create endpoint to avoid client-generated id causing update-path
        const payload = {
          name: trimmedName,
          group: newTagGroup && newTagGroup !== "__uncategorized__" ? newTagGroup : undefined,
          linkUrl: newTagLinkUrl && newTagLinkUrl.trim() ? newTagLinkUrl.trim() : undefined,
          linkLabel: newTagLinkLabel && newTagLinkLabel.trim() ? newTagLinkLabel.trim() : undefined,
        }

        const res = await apiFetch('/api/admin/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) throw new Error('save failed')

        const j = await res.json().catch(() => null)
        const created = j && (j.data || j) ? (j.data || j).length ? (Array.isArray(j.data) ? j.data[0] : j.data) : j.data : null

        // After creating, always re-fetch authoritative tags to reflect DB state
        const fresh = await apiFetch('/api/tags')
        const freshJson = await fresh.json().catch(() => ({ data: [] }))
        const freshTags = Array.isArray(freshJson) ? freshJson : freshJson.data || []
        setTags(freshTags)
        db.tags.saveAll(freshTags)

        setNewTagName("")
        setNewTagGroup("")
        setNewTagLinkUrl("")
        setNewTagLinkLabel("")
        setIsAddDialogOpen(false)

        if (created && (created.id || created.provisional)) {
          toast({ title: '追加完了', description: `タグ「${trimmedName}」を追加しました` })
        } else {
          // defensive: if server didn't return created row, warn but we refreshed list
          toast({ title: '追加完了', description: `タグ「${trimmedName}」を追加しました` })
        }
      } catch (e) {
        console.error('addTag failed', e)
        // fallback: save locally so user can continue
        const updated = [...tags, newTag]
        setTags(updated)
        db.tags.saveAll(updated)
        setNewTagName("")
        setNewTagGroup("")
        setNewTagLinkUrl("")
        setNewTagLinkLabel("")
        setIsAddDialogOpen(false)
        toast({ variant: 'destructive', title: 'サーバ同期失敗', description: 'タグはローカルに保存されました。サーバ同期が復旧後に反映されます' })
      }
    })()
  }

  const updateTag = () => {
    if (!editingTag) return

    const trimmedName = editingTag.name.trim()
    if (!trimmedName) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "タグ名を入力してください",
      })
      return
    }

    if (editingTag.linkUrl?.trim() && !editingTag.linkLabel?.trim()) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "リンク先URLを指定する場合は、リンクボタンのテキストも入力してください",
      })
      return
    }

    // If updating a tag in the special link group, ensure link label is present
    if (editingTag.group === SPECIAL_LINK_GROUP_NAME && !editingTag.linkLabel?.trim()) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "リンク先グループのタグはリンクボタンのテキストが必須です",
      })
      return
    }

    const updated = tags.map((t) =>
      t.id === editingTag.id
        ? {
            ...editingTag,
            name: trimmedName,
            group: editingTag.group?.trim() && editingTag.group !== "__uncategorized__" ? editingTag.group : undefined,
            linkUrl: editingTag.linkUrl?.trim() || undefined,
            linkLabel: editingTag.linkLabel?.trim() || undefined,
          }
        : t,
    )

    ;(async () => {
      try {
        const res = await apiFetch('/api/admin/tags/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tags: updated }),
              })
        if (!res.ok) throw new Error('save failed')

        const fresh = await apiFetch('/api/tags')
        const freshJson = await fresh.json().catch(() => ({ data: [] }))
        const freshTags = Array.isArray(freshJson) ? freshJson : freshJson.data || []
        setTags(freshTags)
        db.tags.saveAll(freshTags)

        setIsEditDialogOpen(false)
        setEditingTag(null)
        toast({ title: '保存完了', description: 'タグ情報を更新しました' })
      } catch (e) {
        console.error('updateTag failed', e)
        // fallback: persist locally
        setTags(updated)
        db.tags.saveAll(updated)
        setIsEditDialogOpen(false)
        setEditingTag(null)
        toast({ variant: 'destructive', title: 'サーバ同期失敗', description: '編集内容はローカルに保存されました' })
      }
    })()
  }

  const removeTag = (tagId: string) => {
    toast({
      title: "削除の確認",
      description: "このタグを削除してもよろしいですか？",
      action: (
        <Button
          variant="destructive"
          size="sm"
            onClick={async () => {
            const updated = tags.filter((t) => t.id !== tagId)
            try {
              const res = await apiFetch('/api/admin/tags/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tags: updated }),
              })
              if (!res.ok) throw new Error('delete failed')

              const fresh = await apiFetch('/api/tags')
              const freshJson = await fresh.json().catch(() => ({ data: [] }))
              const freshTags = Array.isArray(freshJson) ? freshJson : freshJson.data || []
              setTags(freshTags)
              db.tags.saveAll(freshTags)

              toast({
                title: "削除完了",
                description: "タグを削除しました"
              })
            } catch (e) {
              console.error('removeTag failed', e)
              // fallback: remove locally
              setTags(updated)
              db.tags.saveAll(updated)
              toast({ variant: 'destructive', title: 'サーバ同期失敗', description: 'タグはローカルで削除されました' })
            }
          }}
        >
          削除
        </Button>
      ),
    })
  }

  const renameGroup = () => {
    if (!newGroupName.trim() || !editingGroupName) return
    ;(async () => {
      try {
        const res = await apiFetch('/api/admin/tag-groups', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editingGroupName, newName: newGroupName.trim(), label: newGroupName.trim(), visibleWhenTriggerTagIds: selectedVisibility }),
        })
        if (!res.ok) throw new Error('rename group failed')

        const updated = tags.map(t =>
          t.group === editingGroupName ? { ...t, group: newGroupName.trim() } : t
        )
        setTags(updated)
        db.tags.saveAll(updated)
        setIsGroupDialogOpen(false)
        setEditingGroupName("")
        setNewGroupName("")
        setSelectedVisibility([])

        // refresh server group list and metadata
        try {
          const fresh = await apiFetch('/api/tag-groups')
          if (fresh.ok) {
            const freshJson = await fresh.json().catch(() => ({ data: [] }))
            const freshGroups = Array.isArray(freshJson) ? freshJson : freshJson.data || []
            setServerGroups(freshGroups.map((g: any) => g.name))
            const meta: Record<string, any> = {}
            ;(freshGroups || []).forEach((g: any) => {
              if (!g || !g.name) return
                meta[g.name] = { label: g.label || g.name, isImmutable: !!g.is_immutable, visibleWhenTriggerTagIds: Array.isArray(g.visibleWhenTriggerTagIds) ? g.visibleWhenTriggerTagIds : [] }
              })
            setServerGroupMeta(meta)
          }
        } catch (e) {
          // ignore refresh errors
        }
      } catch (e) {
        console.error('rename group failed', e)
        toast({ variant: 'destructive', title: '変更失敗', description: 'グループ名の変更に失敗しました' })
      }
    })()
  }

  const addNewGroup = () => {
    const trimmedGroupName = newGroupName.trim()
    if (!trimmedGroupName) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "グループ名を入力してください"
      })
      return
    }
    
    if (allGroupNames.includes(trimmedGroupName)) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "同じ名前のグループが既に存在します"
      })
      return
    }
    
    ;(async () => {
      try {
        const res = await apiFetch('/api/admin/tag-groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: trimmedGroupName, label: trimmedGroupName, visibleWhenTriggerTagIds: selectedVisibility }),
        })
        if (!res.ok) throw new Error('create group failed')
        setServerGroups(s => Array.from(new Set([...(s || []), trimmedGroupName])))
        toast({ title: '作成完了', description: `グループ「${trimmedGroupName}」を作成しました` })
        setNewGroupName("")
        setIsGroupDialogOpen(false)
        setSelectedVisibility([])

        // refresh server group metadata
        try {
          const fresh = await apiFetch('/api/tag-groups')
          if (fresh.ok) {
            const freshJson = await fresh.json().catch(() => ({ data: [] }))
            const freshGroups = Array.isArray(freshJson) ? freshJson : freshJson.data || []
            setServerGroups(freshGroups.map((g: any) => g.name))
            const meta: Record<string, any> = {}
            ;(freshGroups || []).forEach((g: any) => {
              if (!g || !g.name) return
                meta[g.name] = { label: g.label || g.name, isImmutable: !!g.is_immutable, visibleWhenTriggerTagIds: Array.isArray(g.visibleWhenTriggerTagIds) ? g.visibleWhenTriggerTagIds : [] }
              })
            setServerGroupMeta(meta)
          }
        } catch (e) {}
      } catch (e) {
        console.error('create group failed', e)
        toast({ variant: 'destructive', title: '作成失敗' })
      }
    })()
  }

  // ----- Drag-and-drop (タグ単位) -----
  function SortableTag({ id, tag, groupName, onEdit, onDelete }: any) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      touchAction: 'none' as const,
      userSelect: 'none' as const,
    }

    return (
      <div
        ref={setNodeRef as any}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-background rounded-md border p-3 flex items-center w-full"
      >
        <div className="flex-1 min-w-0 flex items-center gap-3 overflow-hidden">
          <Badge variant="outline" className="gap-1 shrink-0">
            {tag.linkUrl && <LinkIcon className="w-3 h-3" />}
          </Badge>
          <div className="min-w-0 max-w-full">
            <div className="text-sm font-medium truncate">{tag.name}</div>
          </div>
        </div>
        <div className="flex-none flex items-center gap-2">
          {usedTags.has(tag.name) && (
            <div className="text-xs text-muted-foreground mr-2">{usedTags.get(tag.name)}件</div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit(tag)}>編集</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => onDelete(tag.id)} data-variant="destructive">削除</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  async function handleTagMove(activeId: string, overId: string) {
    if (!overId) return
    const [fromGroup, fromTagId] = String(activeId).split('::')
    const [toGroup, toTagId] = String(overId).split('::')

    const current = tags.slice()
    const movingIdx = current.findIndex((t) => t.id === fromTagId)
    if (movingIdx === -1) return
    const moving = { ...current[movingIdx] }

    // remove
    current.splice(movingIdx, 1)

    // determine insertion index
    let insertIndex = current.length
    if (toTagId) {
      const toIdx = current.findIndex((t) => t.id === toTagId)
      insertIndex = toIdx === -1 ? current.length : toIdx
    } else {
      // append to group: find last index of that group
      const tg = toGroup || '未分類'
      let last = -1
      for (let i = 0; i < current.length; i++) if ((current[i].group || '未分類') === tg) last = i
      insertIndex = last === -1 ? current.length : last + 1
    }

    moving.group = (toGroup && toGroup !== '未分類') ? toGroup : undefined
    current.splice(insertIndex, 0, moving)

    const prev = tags.slice()
    setTags(current)
    db.tags.saveAll(current)

    try {
      const payload = current.map((t, i) => ({ id: t.id, order: i, group: t.group }))
      const res = await apiFetch('/api/admin/tags/reorder', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tags: payload })
      })
      if (!res.ok) throw new Error('reorder failed')
      const fresh = await apiFetch('/api/tags')
      if (!fresh.ok) throw new Error('fetch tags failed')
      const freshJson = await fresh.json().catch(() => ({ data: [] }))
      const freshTags = Array.isArray(freshJson) ? freshJson : freshJson.data || []
      setTags(freshTags)
      db.tags.saveAll(freshTags)
    } catch (e) {
      console.error('tag reorder failed', e)
      setTags(prev)
      db.tags.saveAll(prev)
      toast({ variant: 'destructive', title: 'タグの並び替えに失敗しました' })
    }
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || !active) return
    const a = String(active.id)
    const o = String(over.id)
    // only handle tag ids which we encode as `group::id`
    if (a.includes('::') || o.includes('::')) {
      handleTagMove(a, o)
    }
  }

  // Ensure we display server groups even when they have zero tags
  const displayGroupNames = useMemo(() => {
    const names = new Set<string>()
    // show server-declared groups first
    serverGroups.forEach((g) => names.add(g))
    // always include the special link group so UI shows it even when it has no tags
    names.add(SPECIAL_LINK_GROUP_NAME)
    // include any groups derived from tags (e.g., 未分類)
    Array.from(groupedTags.keys()).forEach((g) => names.add(g))
    return Array.from(names)
  }, [serverGroups, groupedTags])

  return (
    <div className="w-full px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin" prefetch={false}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">タグ管理</h1>
            <p className="text-muted-foreground">カスタムタグの管理とグループ化</p>
          </div>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="w-4 h-4 mr-2" />
              新規タグ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新しいタグを追加</DialogTitle>
              <DialogDescription>タグ名、グループ、リンク情報を入力してください</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>タグ名 *</Label>
                <Input
                  placeholder="例: プログラミング"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>グループ名（任意）</Label>
                <Select value={newTagGroup || "__uncategorized__"} onValueChange={setNewTagGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="未分類" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__uncategorized__">未分類</SelectItem>
                    {allGroupNames.map(name => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="または新しいグループ名を入力"
                  value={newTagGroup}
                  onChange={(e) => setNewTagGroup(e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground">同じグループのタグをまとめて表示できます</p>
              </div>
              <div className="space-y-2">
                <Label>リンク先URL（任意）</Label>
                <Input
                  placeholder="https://amazon.co.jp"
                  value={newTagLinkUrl}
                  onChange={(e) => setNewTagLinkUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>リンクボタンのテキスト{newTagLinkUrl.trim() && " *"}</Label>
                <Input
                  placeholder="例: Amazonで見る"
                  value={newTagLinkLabel}
                  onChange={(e) => setNewTagLinkLabel(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  商品編集時にアフィリエイトリンクのラベルとして自動入力されます
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={addTag}>
                  <Plus className="w-4 h-4 mr-1" />
                  追加
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                グループ管理
              </CardTitle>
              <CardDescription>タグをグループ化して整理できます</CardDescription>
            </div>
            <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingGroupName("")
                  setNewGroupName("")
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  グループを追加
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingGroupName ? "グループ名を変更" : "新しいグループを追加"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingGroupName 
                      ? `「${editingGroupName}」グループの名前を変更します`
                      : "タグを整理するためのグループ名を入力してください"
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{editingGroupName ? "新しいグループ名" : "グループ名"}</Label>
                    <Input
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="例: 作業環境、ガジェット、ソフトウェア"
                    />
                  </div>
                    {editingGroupName && (
                      <div className="space-y-2">
                        <Label>このグループを表示する条件</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto border rounded p-2">
                          {(() => {
                            const productKey = Object.keys(serverGroupMeta).find(k => k === PRODUCT_TYPE_GROUP_NAME)
                            const productLabel = productKey ? serverGroupMeta[productKey]?.label : null
                            return tags.filter(t => {
                              const g = t.group || ''
                              return g === productKey || (productLabel && g === productLabel)
                            })
                          })().map((t: any) => (
                            <label key={t.id} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={selectedVisibility.includes(t.id)}
                                onChange={(e) => {
                                  const v = t.id
                                  setSelectedVisibility((prev) => e.target.checked ? Array.from(new Set([...prev, v])) : prev.filter(x => x !== v))
                                }}
                              />
                              <span className="truncate">{t.name}</span>
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">何も選ばれていない場合は「常に表示」。選択肢は「商品の種類」グループ内のタグのみです。</p>
                      </div>
                    )}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
                      キャンセル
                    </Button>
                    <Button onClick={editingGroupName ? renameGroup : addNewGroup}>
                      <Save className="w-4 h-4 mr-1" />
                      {editingGroupName ? "変更" : "追加"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={useSensors(
              useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
              useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
              useSensor(MouseSensor),
            )}
            collisionDetection={closestCenter}
            onDragStart={() => { try { document.body.style.overflow = 'hidden' } catch {} }}
            onDragEnd={(e) => {
              try { document.body.style.overflow = '' } catch {}
              const { active, over } = e
              if (!active || !over) return
              const a = String(active.id)
              const o = String(over.id)
              // only handle group ids (they don't include ::)
              if (!a.includes('::') && !o.includes('::')) {
                handleGroupMove(a, o)
              }
            }}
          >
              <SortableContext items={serverGroups} strategy={rectSortingStrategy}>
              <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
                <div className="bg-background rounded-md border-2 border-dashed p-3 flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">未分類</span>
                </div>
                {serverGroups.map((groupName) => (
                  <SortableGroup key={groupName} id={groupName}>
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{groupName}</span>
                    </div>
                    <div className="flex-none flex items-center gap-2 ml-2">
                      {/* Special handling: protect the special link group from rename/delete */}
                      {groupName !== SPECIAL_LINK_GROUP_NAME && !(serverGroupMeta[groupName]?.isImmutable) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => { setEditingGroupName(groupName); setNewGroupName(groupName); setSelectedVisibility(serverGroupMeta[groupName]?.visibleWhenTriggerTagIds || []); setIsGroupDialogOpen(true) }}>編集</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={async () => {
                              if (!confirm(`グループ「${groupName}」を削除しますか？`)) return
                              try {
                                const res = await apiFetch('/api/admin/tag-groups', {
                                  method: 'DELETE',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ name: groupName }),
                                })
                                if (!res.ok) throw new Error('delete failed')
                                const updatedTags = tags.map((t) => (t.group === groupName ? { ...t, group: undefined } : t))
                                setTags(updatedTags)
                                db.tags.saveAll(updatedTags)
                                // refresh server groups and metadata
                                try {
                                  const fresh = await apiFetch('/api/tag-groups')
                                  if (fresh.ok) {
                                    const freshJson = await fresh.json().catch(() => ({ data: [] }))
                                    const freshGroups = Array.isArray(freshJson) ? freshJson : freshJson.data || []
                                    setServerGroups(freshGroups.map((g: any) => g.name))
                                    const meta: Record<string, any> = {}
                                    ;(freshGroups || []).forEach((g: any) => {
                                      if (!g || !g.name) return
                                          meta[g.name] = { label: g.label || g.name, isImmutable: !!g.is_immutable, visibleWhenTriggerTagIds: Array.isArray(g.visibleWhenTriggerTagIds) ? g.visibleWhenTriggerTagIds : [] }
                                        })
                                    setServerGroupMeta(meta)
                                  } else {
                                    setServerGroups((s) => s.filter((g) => g !== groupName))
                                  }
                                } catch (e) {
                                  setServerGroups((s) => s.filter((g) => g !== groupName))
                                }
                                toast({ title: '削除完了', description: `グループ「${groupName}」を削除しました` })
                              } catch (e) {
                                console.error('delete group failed', e)
                                toast({ variant: 'destructive', title: '削除失敗' })
                              }
                            }} data-variant="destructive">削除</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </SortableGroup>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      <div className="space-y-6">
        
        <div className="border-t pt-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Tag className="w-6 h-6" />
            登録されているタグ
            <Badge variant="outline" className="text-sm">{tags.length}個</Badge>
          </h2>
          
          <DndContext
            sensors={useSensors(
              useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
              useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
              useSensor(MouseSensor),
            )}
            collisionDetection={closestCenter}
            onDragStart={(e) => { try { document.body.style.overflow = 'hidden'; console.debug('dnd:start', { active: (e as any).active?.id }) } catch(_){} }}
            onDragOver={(e) => { try { console.debug('dnd:over', { active: (e as any).active?.id, over: (e as any).over?.id }) } catch(_){} }}
            onDragEnd={(e) => { try { document.body.style.overflow = ''; console.debug('dnd:end', { active: (e as any).active?.id, over: (e as any).over?.id }) } catch(_){}; handleDragEnd(e) }}
          >
            {displayGroupNames.map((groupName) => {
              const groupTags = groupedTags.get(groupName) || []
              return (
                <Card key={groupName} className="mb-4">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-sm font-medium truncate">{groupName}</span>
                        {groupName !== "未分類" && !(serverGroupMeta[groupName]?.isImmutable) && groupName !== SPECIAL_LINK_GROUP_NAME && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => { setEditingGroupName(groupName); setNewGroupName(groupName); setSelectedVisibility(serverGroupMeta[groupName]?.visibleWhenTriggerTagIds || []); setIsGroupDialogOpen(true) }}>編集</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onSelect={async () => {
                                if (!confirm(`グループ「${groupName}」を削除しますか？`)) return
                                try {
                                  const res = await apiFetch('/api/admin/tag-groups', {
                                    method: 'DELETE',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ name: groupName }),
                                  })
                                  if (!res.ok) throw new Error('delete failed')
                                    const updatedTags = tags.map((t) => (t.group === groupName ? { ...t, group: undefined } : t))
                                    setTags(updatedTags)
                                    db.tags.saveAll(updatedTags)
                                    // refresh server groups and metadata
                                    try {
                                      const fresh = await apiFetch('/api/tag-groups')
                                      if (fresh.ok) {
                                        const freshJson = await fresh.json().catch(() => ({ data: [] }))
                                        const freshGroups = Array.isArray(freshJson) ? freshJson : freshJson.data || []
                                        setServerGroups(freshGroups.map((g: any) => g.name))
                                        const meta: Record<string, any> = {}
                                        ;(freshGroups || []).forEach((g: any) => {
                                          if (!g || !g.name) return
                                            meta[g.name] = { label: g.label || g.name, isImmutable: !!g.is_immutable, visibleWhenTriggerTagIds: Array.isArray(g.visibleWhenTriggerTagIds) ? g.visibleWhenTriggerTagIds : [] }
                                          })
                                        setServerGroupMeta(meta)
                                      } else {
                                        setServerGroups((s) => s.filter((g) => g !== groupName))
                                      }
                                    } catch (e) {
                                      setServerGroups((s) => s.filter((g) => g !== groupName))
                                    }
                                    toast({ title: '削除完了', description: `グループ「${groupName}」を削除しました` })
                                } catch (e) {
                                  console.error('delete group failed', e)
                                  toast({ variant: 'destructive', title: '削除失敗' })
                                }
                              }} data-variant="destructive">削除</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      <Badge variant="outline" className="text-sm">{groupTags.length}個</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
                      <SortableContext items={groupTags.length > 0 ? groupTags.map(t => `${groupName}::${t.id}`) : [`${groupName}::__placeholder__`]} strategy={rectSortingStrategy}>
                        {groupTags.length > 0 ? (
                          groupTags.map((tag) => (
                            <SortableTag
                              key={tag.id}
                              id={`${groupName}::${tag.id}`}
                              tag={tag}
                              groupName={groupName}
                              onEdit={(t: any) => { setEditingTag(t); setIsEditDialogOpen(true); }}
                              onDelete={(id: string) => removeTag(id)}
                            />
                          ))
                        ) : (
                          <SortablePlaceholder key={`${groupName}::__placeholder__`} id={`${groupName}::__placeholder__`} groupName={groupName} />
                        )}
                      </SortableContext>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </DndContext>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>タグを編集</DialogTitle>
            <DialogDescription>タグの情報を更新します</DialogDescription>
          </DialogHeader>
          {editingTag && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>タグ名 *</Label>
                <Input
                  value={editingTag.name}
                  onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>グループ名（任意）</Label>
                <Select 
                  value={editingTag.group || "__uncategorized__"} 
                  onValueChange={(value) => setEditingTag({ ...editingTag, group: value === "__uncategorized__" ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="未分類" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__uncategorized__">未分類</SelectItem>
                    {allGroupNames.map(name => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="または新しいグループ名を入力"
                  value={editingTag.group || ""}
                  onChange={(e) => setEditingTag({ ...editingTag, group: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div className="space-y-2">
                <Label>リンク先URL（任意）</Label>
                <Input
                  value={editingTag.linkUrl || ""}
                  onChange={(e) => setEditingTag({ ...editingTag, linkUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>リンクボタンのテキスト{editingTag.linkUrl?.trim() && " *"}</Label>
                <Input
                  value={editingTag.linkLabel || ""}
                  onChange={(e) => setEditingTag({ ...editingTag, linkLabel: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={updateTag}>
                  <Save className="w-4 h-4 mr-1" />
                  保存
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGroupName ? "グループ名を変更" : "新しいグループを追加"}
            </DialogTitle>
            <DialogDescription>
              {editingGroupName 
                ? `「${editingGroupName}」グループの名前を変更します`
                : "タグを整理するためのグループ名を入力してください"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{editingGroupName ? "新しいグループ名" : "グループ名"}</Label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="例: 作業環境、ガジェット、ソフトウェア"
              />
            </div>
            {editingGroupName && (
              <div className="space-y-2">
                <Label>このグループを表示する条件</Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto border rounded p-2">
                  {tags.map((t) => (
                    <label key={t.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedVisibility.includes(t.id)}
                        onChange={(e) => {
                          const v = t.id
                          setSelectedVisibility((prev) => e.target.checked ? Array.from(new Set([...prev, v])) : prev.filter(x => x !== v))
                        }}
                      />
                      <span className="truncate">{t.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">何も選ばれていない場合は「常に表示」</p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={editingGroupName ? renameGroup : addNewGroup}>
                <Save className="w-4 h-4 mr-1" />
                {editingGroupName ? "変更" : "追加"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
