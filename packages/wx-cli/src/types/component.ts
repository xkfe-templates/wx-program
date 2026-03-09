export interface ComponentMeta {
  name: string
  displayName: string
  description: string
  version: string
  category: 'navigation' | 'feedback' | 'data-display' | 'form' | 'layout' | 'basic'
  dependencies: string[]
  miniprogram: {
    minVersion: string
  }
  files: string[]
  config: {
    usingComponents: Record<string, string>
  }
}

export interface ComponentRegistry {
  version: string
  components: string[]
}
