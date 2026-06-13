"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type ConfirmOptions = {
  title?: string
  description?: React.ReactNode
  confirmText?: string
  cancelText?: string
  /** destructive styles the confirm button in red (default true). */
  destructive?: boolean
}

type ConfirmState = ConfirmOptions & {
  open: boolean
  resolve?: (value: boolean) => void
}

let listener: ((state: ConfirmState) => void) | null = null
let current: ConfirmState = { open: false }

function emit() {
  listener?.(current)
}

/**
 * Imperative confirmation dialog — a drop-in replacement for `window.confirm`
 * that matches the app's design and toast/feedback patterns.
 *   if (await confirm({ title: '削除しますか？' })) { ... }
 */
export function confirm(options: ConfirmOptions = {}): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    current = { ...options, open: true, resolve }
    emit()
  })
}

export function Confirmer() {
  const [state, setState] = React.useState<ConfirmState>(current)

  React.useEffect(() => {
    listener = setState
    return () => {
      listener = null
    }
  }, [])

  const finish = (value: boolean) => {
    state.resolve?.(value)
    current = { ...current, open: false, resolve: undefined }
    emit()
  }

  return (
    <Dialog open={state.open} onOpenChange={(o) => { if (!o) finish(false) }}>
      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{state.title ?? "確認"}</DialogTitle>
          {state.description ? (
            <DialogDescription>{state.description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => finish(false)}>
            {state.cancelText ?? "キャンセル"}
          </Button>
          <Button
            variant={state.destructive === false ? "default" : "destructive"}
            onClick={() => finish(true)}
            autoFocus
          >
            {state.confirmText ?? "実行する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
