export type Step = 'file' | 'crop' | 'scale' | 'walls' | 'dimensions' | 'openings'

type WallEnd = { wallId: string } | { position: number }

type Wall = {
  id: string
  orientation: 'horizontal' | 'vertical'
  center: number
  thicknessCm: number
  kind: 'exterior' | 'loadBearing' | 'partition' | 'custom' | 'divider'
  from: WallEnd
  to: WallEnd
}

type Opening = {
  id: string
  wallId: string
  kind: 'door' | 'window' | 'garage'
  widthCm: number
  leafWidthCm: number | null
  sillCm: number | null
  anchor: 'from' | 'to'
  anchorWallId: string | null
  offsetCm: number
  hinge: 'from' | 'to'
  opensTo: 'min' | 'max'
}

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
  walls: Wall[]
  locks: { a: string; b: string; valueCm: number }[]
  rooms: { name: string; x: number; y: number }[]
  openings: Opening[]
  created_at: string
}

type ProjectRow = {
  id: string
  owner_id: string
  name: string
  created_at: string
}

export type ProjectShareRow = {
  project_id: string
  user_id: string
  status: 'pending' | 'accepted'
  invited_by: string
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
        Update: Partial<
          Pick<
            FloorRow,
            | 'step'
            | 'plan'
            | 'rotation_deg'
            | 'crop'
            | 'outline'
            | 'walls'
            | 'locks'
            | 'rooms'
            | 'openings'
          >
        >
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
      project_shares: {
        Row: ProjectShareRow
        Insert: never
        Update: Partial<Pick<ProjectShareRow, 'status'>>
        Relationships: [
          {
            foreignKeyName: 'project_shares_project_id_fkey'
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
      delete_floor: {
        Args: { project_id: string; floor_id: string }
        Returns: 'deleted' | 'last' | 'missing'
      }
      share_project: {
        Args: { project_id: string; email: string }
        Returns: boolean
      }
    }
  }
}
