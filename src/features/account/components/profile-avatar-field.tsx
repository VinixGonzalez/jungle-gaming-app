import { useRef } from "react"
import { ImagePlus, UserRound } from "lucide-react"

import { Button } from "@/shared/components/ui/button"

import type { CollectorProfile } from "../api/account.schemas"
import { useAvatarControl } from "../hooks/use-avatar-control"

interface ProfileAvatarFieldProps {
  profile: CollectorProfile
}

export function ProfileAvatarField({
  profile,
}: ProfileAvatarFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const avatar = useAvatarControl()

  return (
    <div className="min-w-0">
      <span className="flex min-h-6 items-center text-size-14 leading-size-16">
        Avatar
      </span>
      <div className="flex min-h-12.5 flex-wrap items-center gap-3">
        <div className="grid size-12.5 shrink-0 place-items-center overflow-hidden rounded-full bg-surface-raised text-text-secondary">
          {profile.avatarUrl ? (
            <img
              alt={`Avatar de ${profile.displayName}`}
              className="size-full object-cover"
              src={profile.avatarUrl}
            />
          ) : (
            <UserRound aria-hidden="true" className="size-5" />
          )}
        </div>
        <input
          accept="image/png,image/jpeg,image/webp"
          disabled={avatar.isPending}
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0]

            if (file) void avatar.update(file)
            event.target.value = ""
          }}
          ref={inputRef}
          type="file"
        />
        <Button
          className="h-10 px-4 text-size-13 font-bold"
          disabled={avatar.isPending}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <ImagePlus aria-hidden="true" className="size-4" />
          {profile.avatarUrl ? "Alterar" : "Adicionar"}
        </Button>
        <Button
          className="h-10 px-1 text-size-13 text-text-secondary"
          disabled={!profile.avatarUrl || avatar.isPending}
          onClick={() => void avatar.remove()}
          type="button"
          variant="ghost"
        >
          Remover
        </Button>
      </div>
      {avatar.error ? (
        <p className="mt-1 text-size-11 text-error-text" role="alert">
          {avatar.error}
        </p>
      ) : null}
      {avatar.feedback ? (
        <p className="mt-1 text-size-11 text-success" role="status">
          {avatar.feedback}
        </p>
      ) : null}
    </div>
  )
}
