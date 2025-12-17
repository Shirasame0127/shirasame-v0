'use client'

import * as React from 'react'
import * as SheetPrimitive from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function Sheet({ children, ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...(props as any)}>{children}</SheetPrimitive.Root>
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  const handleClick: React.MouseEventHandler = (e) => {
    try {
      // attempt to find a close button in the same portal and click it
      const portal = (e.currentTarget as HTMLElement).closest('[data-slot="sheet-portal"]') || document.querySelector('[data-slot="sheet-portal"]')
      const closeBtn = portal ? (portal as HTMLElement).querySelector('[data-slot="sheet-close"]') as HTMLElement | null : null
      if (closeBtn) {
        // eslint-disable-next-line no-console
        console.debug('[SheetOverlay] clicking portal close button')
        closeBtn.click()
        return
      }
      const anyClose = document.querySelector('[data-slot="sheet-close"]') as HTMLElement | null
      if (anyClose) {
        // eslint-disable-next-line no-console
        console.debug('[SheetOverlay] clicking any close button')
        anyClose.click()
      }
    } catch (err) {
      // ignore
    }
    if (props && typeof (props as any).onClick === 'function') (props as any).onClick(e)
  }

  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn('fixed inset-0 z-40 bg-black transition-opacity duration-200', className)}
      onClick={handleClick}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = 'right',
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: 'top' | 'right' | 'bottom' | 'left'
}) {
  const descriptionId = React.useId() || 'sheet-description-default'
  return (
    <SheetPortal>
      <style>{`
        /* Overlay animations - force pointer-events override to avoid inline style blocking */
        [data-slot="sheet-overlay"]{opacity:0;pointer-events:none !important}
        [data-slot="sheet-overlay"][data-state="open"]{animation: overlay-fade-in .2s ease forwards;pointer-events:auto !important}
        [data-slot="sheet-overlay"][data-state="closed"]{animation: overlay-fade-out .2s ease forwards;pointer-events:none !important}
        @keyframes overlay-fade-in{from{opacity:0}to{opacity:.5}}@keyframes overlay-fade-out{from{opacity:.5}to{opacity:0}}

        /* Bottom sheet animations (use keyframes so mount shows animation) */
        [data-slot="sheet-content"]{pointer-events:none !important}
        [data-slot="sheet-content"][data-side="bottom"]{transform:translateY(100%);opacity:0}
        [data-slot="sheet-content"][data-side="bottom"][data-state="open"]{animation: sheet-slide-in .28s cubic-bezier(.16,.84,.3,1) forwards;pointer-events:auto !important}
        [data-slot="sheet-content"][data-side="bottom"][data-state="closed"]{animation: sheet-slide-out .2s cubic-bezier(.16,.84,.3,1) forwards;pointer-events:none !important}
        @keyframes sheet-slide-in{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes sheet-slide-out{from{transform:translateY(0);opacity:1}to{transform:translateY(100%);opacity:0}}
      `}</style>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        {...props}
        aria-describedby={descriptionId}
        className={cn(
          'bg-background fixed z-50 flex flex-col gap-4 shadow-lg transform-gpu will-change-transform ease-in-out duration-200',
          side === 'right' && 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
          side === 'left' && 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
          side === 'top' && 'inset-x-0 top-0 h-auto border-b',
          side === 'bottom' && 'inset-x-0 bottom-0 h-auto border-t',
          className,
        )}
      >
        <SheetPrimitive.Description id={descriptionId} className="sr-only">
          フィルターを絞り込むパネル
        </SheetPrimitive.Description>
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn('flex flex-col gap-1.5 p-4', className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn('text-foreground font-semibold', className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
