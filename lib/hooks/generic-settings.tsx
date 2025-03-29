"use client"

import { useState } from "react"

import { usePipeSettings } from "./use-pipe-settings"

export function GenericSettings() {
  const { settings, updateSettings, loading } = usePipeSettings("example")
  const [isSaving, setIsSaving] = useState(false)

  if (loading) {
    return <div>loading settings...</div>
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateSettings(settings!)
      console.log("settings saved successfully")
    } catch (error) {
      console.error("failed to save settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full max-w-2xl rounded-lg border p-4">
      <h2 className="mb-4 text-lg font-medium">pipe settings</h2>

      {/* Add your settings UI here */}
      <div className="space-y-4">
        {/* Example setting field */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            example setting
          </label>
          <input
            type="text"
            className="w-full rounded border p-2"
            value={settings?.exampleSetting || ""}
            onChange={(e) =>
              updateSettings({
                ...settings!,
                exampleSetting: e.target.value,
              })
            }
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "saving..." : "save settings"}
        </button>
      </div>
    </div>
  )
}
