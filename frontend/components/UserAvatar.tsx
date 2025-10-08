'use client';

import { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { 
  avataaars, 
  bottts, 
  personas, 
  lorelei, 
  thumbs, 
  funEmoji,
  adventurer,
  bigSmile,
  croodles,
  micah,
  miniavs,
  openPeeps,
  pixelArt,
  shapes,
  notionists
} from '@dicebear/collection';
import Image from 'next/image';

interface UserAvatarProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    avatarStyle?: string;
    avatarSeed?: string | null;
  };
  size?: number;
  className?: string;
}

export function UserAvatar({ user, size = 40, className = '' }: UserAvatarProps) {
  const avatarUrl = useMemo(() => {
    const style = user.avatarStyle || 'initials';
    
    // Handle initials style
    if (style === 'initials') {
      return null; // Will render initials div instead
    }

    // Get the avatar style based on the selected style
    const seed = user.avatarSeed || user.email;
    let avatar;

    switch (style) {
      case 'avataaars':
        avatar = createAvatar(avataaars, { seed, size });
        break;
      case 'bottts':
        avatar = createAvatar(bottts, { seed, size });
        break;
      case 'personas':
        avatar = createAvatar(personas, { seed, size });
        break;
      case 'lorelei':
        avatar = createAvatar(lorelei, { seed, size });
        break;
      case 'thumbs':
        avatar = createAvatar(thumbs, { seed, size });
        break;
      case 'funEmoji':
        avatar = createAvatar(funEmoji, { seed, size });
        break;
      case 'adventurer':
        avatar = createAvatar(adventurer, { seed, size });
        break;
      case 'bigSmile':
        avatar = createAvatar(bigSmile, { seed, size });
        break;
      case 'croodles':
        avatar = createAvatar(croodles, { seed, size });
        break;
      case 'micah':
        avatar = createAvatar(micah, { seed, size });
        break;
      case 'miniavs':
        avatar = createAvatar(miniavs, { seed, size });
        break;
      case 'openPeeps':
        avatar = createAvatar(openPeeps, { seed, size });
        break;
      case 'pixelArt':
        avatar = createAvatar(pixelArt, { seed, size });
        break;
      case 'shapes':
        avatar = createAvatar(shapes, { seed, size });
        break;
      case 'notionists':
        avatar = createAvatar(notionists, { seed, size });
        break;
      default:
        return null; // Fallback to initials
    }

    return avatar.toDataUri();
  }, [user.avatarStyle, user.avatarSeed, user.email, size]);

  // Render initials if no avatar URL
  if (!avatarUrl) {
    return (
      <div
        className={`rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {user.firstName[0]}{user.lastName[0]}
      </div>
    );
  }

  // Render DiceBear avatar
  return (
    <Image
      src={avatarUrl}
      alt={`${user.firstName} ${user.lastName}`}
      className={`rounded-full ${className}`}
      width={size}
      height={size}
      unoptimized // SVG data URIs don't need optimization
    />
  );
}

// Export available styles organized by category
export const AVATAR_CATEGORIES = {
  basic: {
    name: 'Basic',
    styles: [
      { id: 'initials', name: 'Initials', description: 'Your initials with gradient' },
    ]
  },
  cartoon: {
    name: 'Cartoon',
    styles: [
      { id: 'avataaars', name: 'Avataaars', description: 'Cartoon-style avatars' },
      { id: 'lorelei', name: 'Lorelei', description: 'Illustrated characters' },
      { id: 'bigSmile', name: 'Big Smile', description: 'Smiling characters' },
      { id: 'adventurer', name: 'Adventurer', description: 'Adventure characters' },
      { id: 'openPeeps', name: 'Open Peeps', description: 'Hand-drawn style' },
    ]
  },
  abstract: {
    name: 'Abstract',
    styles: [
      { id: 'personas', name: 'Personas', description: 'Abstract personas' },
      { id: 'shapes', name: 'Shapes', description: 'Geometric shapes' },
      { id: 'notionists', name: 'Notionists', description: 'Notion-style avatars' },
    ]
  },
  fun: {
    name: 'Fun',
    styles: [
      { id: 'bottts', name: 'Bottts', description: 'Robot avatars' },
      { id: 'funEmoji', name: 'Fun Emoji', description: 'Emoji-style avatars' },
      { id: 'thumbs', name: 'Thumbs', description: 'Thumbs up avatars' },
      { id: 'croodles', name: 'Croodles', description: 'Doodle-style avatars' },
    ]
  },
  artistic: {
    name: 'Artistic',
    styles: [
      { id: 'micah', name: 'Micah', description: 'Illustrated portraits' },
      { id: 'miniavs', name: 'Miniavs', description: 'Minimalist avatars' },
      { id: 'pixelArt', name: 'Pixel Art', description: 'Retro pixel art' },
    ]
  }
};
