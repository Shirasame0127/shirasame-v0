"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Plus, Trash2, Tag, Edit, LinkIcon } from 'lucide-react'
import Link from "next/link"
import { db } from "@/lib/db/storage"
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

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Array<{ id: string; name: string; group?: string; linkUrl?: string; linkLabel?: string }>>([])
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
  const { toast } = useToast()

  useEffect(() => {
    const storedTags = db.tags.getAllWithPlaceholders()
    setTags(storedTags)
  }, [])

  const usedTags = useMemo(() => {
    const tagCounts = new Map<string, number>()
    const products = db.products.getAll()
    products.forEach((product) => {
      product.tags.forEach((tag) => {
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
  }, [tags])

  const allGroupNames = useMemo(() => {
    const names = new Set<string>()
    tags.forEach((tag) => {
      if (tag.group && tag.group !== "未分類") {
        names.add(tag.group)
      }
    })
    return Array.from(names).sort()
  }, [tags])

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

    const newTag = {
      id: `tag-${Date.now()}`,
      name: trimmedName,
      group: newTagGroup.trim() && newTagGroup !== "__uncategorized__" ? newTagGroup : undefined,
      linkUrl: newTagLinkUrl.trim() || undefined,
      linkLabel: newTagLinkLabel.trim() || undefined,
    }

    const updated = [...tags, newTag]
    setTags(updated)
    db.tags.saveAll(updated)
    
    setNewTagName("")
    setNewTagGroup("")
    setNewTagLinkUrl("")
    setNewTagLinkLabel("")
    setIsAddDialogOpen(false)
  }

  const updateTag = () => {
    if (!editingTag) return

    const trimmedName = editingTag.name.trim()
    if (!trimmedName) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "タグ名を入力してください"
      })
      return
    }

    if (editingTag.linkUrl?.trim() && !editingTag.linkLabel?.trim()) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "リンク先URLを指定する場合は、リンクボタンのテキストも入力してください"
      })
      return
    }

    const updated = tags.map(t => 
      t.id === editingTag.id 
        ? {
            ...editingTag,
            name: trimmedName,
            group: editingTag.group?.trim() && editingTag.group !== "__uncategorized__" ? editingTag.group : undefined,
            linkUrl: editingTag.linkUrl?.trim() || undefined,
            linkLabel: editingTag.linkLabel?.trim() || undefined,
          }
        : t
    )
    setTags(updated)
    db.tags.saveAll(updated)
    setIsEditDialogOpen(false)
    setEditingTag(null)
  }

  const removeTag = (tagId: string) => {
    toast({
      title: "削除の確認",
      description: "このタグを削除してもよろしいですか？",
      action: (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            const updated = tags.filter((t) => t.id !== tagId)
            setTags(updated)
            db.tags.saveAll(updated)
            toast({
              title: "削除完了",
              description: "タグを削除しました"
            })
          }}
        >
          削除
        </Button>
      ),
    })
  }

  const renameGroup = () => {
    if (!newGroupName.trim() || !editingGroupName) return
    
    const updated = tags.map(t => 
      t.group === editingGroupName 
        ? { ...t, group: newGroupName.trim() } 
        : t
    )
    setTags(updated)
    db.tags.saveAll(updated)
    setIsGroupDialogOpen(false)
    setEditingGroupName("")
    setNewGroupName("")
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
    
    console.log("[v0] TagsPage: Creating new group:", trimmedGroupName)
    
    const groupPlaceholder = {
      id: `group-placeholder-${Date.now()}`,
      name: `__GROUP_PLACEHOLDER__${trimmedGroupName}`,
      group: trimmedGroupName,
    }
    
    const updated = [...tags, groupPlaceholder]
    setTags(updated)
    db.tags.saveAll(updated)
    
    console.log("[v0] TagsPage: Group created:", trimmedGroupName)
    toast({
      title: "作成完了",
      description: `グループ「${trimmedGroupName}」を作成しました`
    })
    setNewGroupName("")
    setIsGroupDialogOpen(false)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            <div className="bg-background rounded-md border-2 border-dashed p-3 flex items-center justify-center">
              <span className="text-sm text-muted-foreground">未分類</span>
            </div>
            {allGroupNames.map((groupName) => (
              <div 
                key={groupName}
                className="bg-background rounded-md border p-3 flex items-center justify-between"
              >
                <span className="text-sm font-medium truncate">{groupName}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => {
                    setEditingGroupName(groupName)
                    setNewGroupName(groupName)
                    setIsGroupDialogOpen(true)
                  }}
                >
                  <Edit className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {Array.from(usedTags.entries()).length}
              </Badge>
              使用中のタグ
            </CardTitle>
            <CardDescription>現在商品に設定されているタグと使用数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.from(usedTags.entries()).length === 0 ? (
                <span className="text-sm text-muted-foreground">使用中のタグはありません</span>
              ) : (
                Array.from(usedTags.entries()).map(([tagName, count]) => (
                  <Badge key={tagName} variant="secondary" className="gap-2">
                    <Tag className="w-3 h-3" />
                    {tagName}
                    <span className="text-xs bg-background/50 px-1.5 py-0.5 rounded">{count}</span>
                  </Badge>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="border-t pt-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Tag className="w-6 h-6" />
            登録されているタグ
            <Badge variant="outline" className="text-sm">{tags.length}個</Badge>
          </h2>
          
          {Array.from(groupedTags.entries()).map(([groupName, groupTags]) => (
            <Card key={groupName} className="mb-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{groupName}</CardTitle>
                    <CardDescription>{groupTags.length}個のタグ</CardDescription>
                  </div>
                  {groupName !== "未分類" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingGroupName(groupName)
                        setNewGroupName(groupName)
                        setIsGroupDialogOpen(true)
                      }}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      グループ名変更
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {groupTags.map((tag) => (
                    <div key={tag.id} className="flex items-center gap-1 bg-muted px-3 py-2 rounded-md">
                      <Badge variant="outline" className="gap-1">
                        {tag.linkUrl && <LinkIcon className="w-3 h-3" />}
                        {tag.name}
                        {usedTags.has(tag.name) && (
                          <span className="text-xs bg-primary/10 px-1.5 py-0.5 rounded">{usedTags.get(tag.name)}</span>
                        )}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          setEditingTag(tag)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeTag(tag.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
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
