'use client';
import React from 'react'
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import '../../styles/playlistRedirect.css';
function PlaylistRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === 'true';
  console.log(success);
  return (
    <div className='playlist-redirect-wrapper'>
    <div className='playlist-redirect-container'>
     <p className='playlist-redirect-message'>{success?"PLAYLIST HAS BEEN CREATED!":"SOMETHING WENT WRONG"}</p>
     <button className='playlist-redirect-button' onClick={()=>router.push('/')}>Return home</button>
    </div>
    </div>
  )
}

export default PlaylistRedirect
