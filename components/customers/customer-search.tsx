'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '../ui/input'
import debounce from 'lodash/debounce'
import { useServices } from '@/hooks/useService'
import { CustomerRecord } from '@/services/types'

interface Props {
  onSelect: (customer: CustomerRecord) => void
}

export function CustomerSearch({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CustomerRecord[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { customers } = useServices()

  const searchCustomers = debounce(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) return
    try {
      const results = await customers.search(searchQuery)
      setResults(results)
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      setResults([])
    }
  }, 300)

  useEffect(() => {
    searchCustomers(query)
  }, [query])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        type="text"
        placeholder="Rechercher un client..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setIsOpen(true)
        }}
      />

      {isOpen && results.length > 0 && (
        <div className="absolute w-full mt-1 bg-white border rounded-md shadow-lg z-10 max-h-60 overflow-auto">
          {results.map((user) => (
            <div
              key={user.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onSelect(user)
                setQuery('')
                setIsOpen(false)
              }}
            >
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-gray-600">{user.email}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
