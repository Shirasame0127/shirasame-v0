"use client"

import React from "react"
// Render the shared editor component from the common `.../recipes/edit/page.tsx`.
// This wrapper exists so the dynamic route `/admin/recipes/[id]/edit` is a
// valid module that can render the same client-side editor UI.
import SharedEditor from "../../edit/page"

export default function RecipeEditDynamicWrapper() {
	return <SharedEditor />
}

