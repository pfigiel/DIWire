export type Step = 'file' | 'crop' | 'scale' | 'walls' | 'dimensions' | 'openings'

export type FloorRow = {
  id: string
  project_id: string
  position: number
  step: Step
  plan: {
    name: string
    page: number | null
    imagePath: string
    width: number
    height: number
  } | null
  rotation_deg: number
  crop: { x: number; y: number; width: number; height: number } | null
  outline: { widthCm: number; heightCm: number } | null
  created_at: string
}

type ProjectRow = {
  id: string
  owner_id: string
  name: string
  created_at: string
}

/** The shape postgrest-js infers query results from; it mirrors `supabase/migrations`. */
export type Database = {
  public: {
    Tables: {
      projects: {
        Row: ProjectRow
        Insert: Pick<ProjectRow, 'name'>
        Update: Partial<Pick<ProjectRow, 'name'>>
        Relationships: []
      }
      floors: {
        Row: FloorRow
        Insert: Pick<FloorRow, 'project_id' | 'position'>
        Update: Partial<Pick<FloorRow, 'step' | 'plan' | 'rotation_deg' | 'crop' | 'outline'>>
        Relationships: [
          {
            foreignKeyName: 'floors_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<never, never>
    Functions: {
      create_project: {
        Args: { name: string }
        Returns: { id: string; floor_id: string }[]
      }
    }
  }
}
