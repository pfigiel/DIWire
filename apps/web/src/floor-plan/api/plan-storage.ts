import { queryOptions } from '@tanstack/react-query'
import { getSession } from '@/auth/api/session'
import { supabase } from '@/auth/api/supabase'

const plans = () => supabase.storage.from('plans')

const linkLifetimeSeconds = 60 * 60

/** Stores the image under the user's own folder, which is what the bucket's policies let them reach. */
export const uploadPlanImage = async (image: Blob) => {
  const session = await getSession()

  if (session === null) throw new Error('Uploading a plan needs a signed-in user')

  const path = `${session.user.id}/${crypto.randomUUID()}`
  const { error } = await plans().upload(path, image, { contentType: image.type })

  if (error) throw error

  return path
}

export const removePlanImage = async (path: string) => {
  const { error } = await plans().remove([path])

  if (error) throw error
}

export const planImageQuery = (path: string) =>
  queryOptions({
    queryKey: ['plan-image', path],
    queryFn: async () => {
      const { data, error } = await plans().createSignedUrl(path, linkLifetimeSeconds)

      if (error) throw error

      return data.signedUrl
    },
    // Refetched well before the link expires, so an image never points at a dead one.
    staleTime: (linkLifetimeSeconds * 1000) / 2,
  })
