import { forwardToPublicWorker } from '@/lib/api-proxy'

export async function GET(req: Request) { return forwardToPublicWorker(req) }
export async function POST(req: Request) { return forwardToPublicWorker(req) }
export async function PUT(req: Request) { return forwardToPublicWorker(req) }
export async function DELETE(req: Request) { return forwardToPublicWorker(req) }
export async function PATCH(req: Request) { return forwardToPublicWorker(req) }
export async function OPTIONS(req: Request) { return forwardToPublicWorker(req) }

export const runtime = 'nodejs'
