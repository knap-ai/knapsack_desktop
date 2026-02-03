import { useCallback, useEffect, useState } from 'react'

import { signout as signoutAPI, updateLastSeen } from 'src/api/connections'
import { KNLocalStorage } from 'src/utils/KNLocalStorage'

export const PROFILE_KEY = 'KN_PROFILE'

export type Profile = {
  email: string
  profile_image?: string
  name?: string
  uuid: string
  provider?: string
  sharing_permission?: number
}

export interface IAuth {
  fetchProfile: () => void
  profile: Profile | undefined
  updateProfile: (profile?: Profile) => void
  signout: () => void
}

export const useAuth = (): IAuth => {
  const [profile, setProfile] = useState<Profile | undefined>()

  async function downloadAndCreateBlobUrl(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error('Error downloading profile image:', error)
      return imageUrl
    }
  }

  const fetchProfile = useCallback(async () => {
    const storageProfile = await KNLocalStorage.getItem(PROFILE_KEY)
    if (storageProfile) {
      setProfile(storageProfile)
      return
    }
  }, [])

  const fetchProfileImg = async (profile?: Profile) => {
    const storageProfile = await KNLocalStorage.getItem(PROFILE_KEY)
    let profileImgOld = undefined
    if (
      storageProfile &&
      storageProfile.profile_image !== null &&
      storageProfile.profile_image.includes('data:image')
    ) {
      profileImgOld = storageProfile.profile_image
    }
    if (profile?.profile_image) {
      try {
        const localImageUrl = await downloadAndCreateBlobUrl(profile.profile_image)
        if (!localImageUrl.includes('data:image') && profileImgOld) {
          profile.profile_image = profileImgOld
        } else {
          profile.profile_image = localImageUrl
        }
      } catch (error) {
        console.error('Failed to download and create blob URL for profile image:', error)
      }
    }
    return profile
  }

  const updateProfile = useCallback(async (profile?: Profile) => {
    const updatedProfile = await fetchProfileImg(profile)
    KNLocalStorage.setItem(PROFILE_KEY, updatedProfile)
    if (updatedProfile) {
      const result = await updateLastSeen(updatedProfile.email)
      if (result.success && result.sharing_permission !== undefined) {
        updatedProfile.sharing_permission = result.sharing_permission
      }
    }

    setProfile(updatedProfile)
  }, [])

  const signout = useCallback(() => {
    return signoutAPI()
      .then(() => updateProfile(undefined))
      .catch((error: any) => {
        throw error
      })
  }, [updateProfile])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    fetchProfile,
    profile,
    updateProfile,
    signout,
  }
}
