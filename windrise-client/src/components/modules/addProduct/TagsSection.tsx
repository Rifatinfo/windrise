"use client";
import React, { useState } from 'react'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react';
interface TagsSectionProps {
  tags: string[]
  onChange: (tags: string[]) => void
}
export function TagsSection({ tags, onChange }: TagsSectionProps) {
  const [inputValue, setInputValue] = useState('')
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      if (!tags.includes(inputValue.trim())) {
        onChange([...tags, inputValue.trim()])
      }
      setInputValue('')
    }
  }
  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove))
  }
  return (
    <Card>
      <div className='px-2'>
        <h3 className="text-lg font-semibold">Tags</h3>
        <p className="text-sm text-slate-500">Add keywords to help find this product</p>
      </div>
      <div className="space-y-4 mt-4 px-2">
        <Input
          placeholder="Type and press Enter to add..."

          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div className="flex flex-wrap gap-2 min-h-[2rem]">
          {tags.length === 0 && (
            <p className="text-sm text-slate-400 italic">No tags added yet</p>
          )}
          {tags.map((tag: any, idx: number) => (
            <Badge key={tag.id || idx || tag}>
              {tag?.name}
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  )
}