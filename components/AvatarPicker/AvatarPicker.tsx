"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import css from "./AvatarPicker.module.css";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

type Props = {
  profilePhotoUrl?: string;
  onChangePhoto: (file: File | null) => void;
};

export default function AvatarPicker({
  profilePhotoUrl,
  onChangePhoto,
}: Props) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setPreviewUrl(profilePhotoUrl ?? "");
  }, [profilePhotoUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError("");

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Only images");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Max file size 5MB");
      return;
    }

    onChangePhoto(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChangePhoto(null);
    setPreviewUrl("");
  };

  const isRemoteImage = previewUrl.startsWith("http");

  return (
    <div>
      <div className={css.picker}>
        {previewUrl && (
          <Image
            src={previewUrl}
            alt="Preview"
            width={300}
            height={300}
            className={css.avatar}
            unoptimized={!isRemoteImage}
          />
        )}
        <label
          className={
            previewUrl ? `${css.wrapper} ${css.reload}` : css.wrapper
          }
        >
          📷 Choose photo
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={css.input}
          />
        </label>
        {previewUrl && (
          <button
            type="button"
            className={css.remove}
            onClick={handleRemove}
            aria-label="Remove photo"
          >
            ❌
          </button>
        )}
      </div>
      {error && <p className={css.error}>{error}</p>}
    </div>
  );
}
