import { redirect } from 'next/navigation'

import { getSession } from '../lib/session.js'

export default async function Home() {
  redirect((await getSession()) ? '/students' : '/login')
}
