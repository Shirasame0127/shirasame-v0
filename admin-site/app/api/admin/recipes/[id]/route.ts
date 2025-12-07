import { forwardToPublicWorker } from '@/lib/api-proxy'

export async function GET(req: Request, ctx?: any) { return forwardToPublicWorker(req) }
export async function POST(req: Request, ctx?: any) { return forwardToPublicWorker(req) }
export async function PUT(req: Request, ctx?: any) { return forwardToPublicWorker(req) }
export async function DELETE(req: Request, ctx?: any) { return forwardToPublicWorker(req) }
export async function PATCH(req: Request, ctx?: any) { return forwardToPublicWorker(req) }
export async function OPTIONS(req: Request, ctx?: any) { return forwardToPublicWorker(req) }

export const runtime = 'nodejs'
