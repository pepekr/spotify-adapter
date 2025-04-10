'use client';
import React from 'react'
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
function PlaylistRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get('success');

  return (
    <div>
     <p>{success?"Playlist Created!":"Something went wrong"}</p>
     <button onClick={()=>router.push('/')}>Return home</button>
    </div>
  )
}

export default PlaylistRedirect
