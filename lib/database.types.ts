export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string // UUID
          nombre: string
          email: string
          password_hash: string
          rol: "cliente" | "admin" | "distribuidor"
          creado_en: string
          direccion: string | null // NUEVO CAMPO
          telefono: string | null // NUEVO CAMPO
        }
        Insert: {
          id?: string // UUID opcional
          nombre: string
          email: string
          password_hash: string
          rol: "cliente" | "admin" | "distribuidor"
          creado_en?: string
          direccion?: string | null // NUEVO CAMPO
          telefono?: string | null // NUEVO CAMPO
        }
        Update: {
          id?: string
          nombre?: string
          email?: string
          password_hash?: string
          rol?: "cliente" | "admin" | "distribuidor"
          creado_en?: string
          direccion?: string | null // NUEVO CAMPO
          telefono?: string | null // NUEVO CAMPO
        }
      }
      categorias: {
        Row: {
          id: number // SERIAL
          nombre: string
        }
        Insert: {
          id?: number // SERIAL opcional
          nombre: string
        }
        Update: {
          id?: number
          nombre?: string
        }
      }
      productos: {
        Row: {
          id: number // SERIAL
          nombre: string
          descripcion: string | null
          precio: number // NUMERIC(10,2)
          stock: number | null
          imagen_url: string | null
          tipo: "propio" | "dropshipping"
          activo: boolean
          creado_por: string | null // UUID
          categoria_id: number | null // INTEGER
        }
        Insert: {
          id?: number // SERIAL opcional
          nombre: string
          descripcion?: string | null
          precio: number
          stock?: number | null
          imagen_url?: string | null
          tipo: "propio" | "dropshipping"
          activo?: boolean
          creado_por?: string | null // UUID
          categoria_id?: number | null
        }
        Update: {
          id?: number
          nombre?: string
          descripcion?: string | null
          precio?: number
          stock?: number | null
          imagen_url?: string | null
          tipo?: "propio" | "dropshipping"
          activo?: boolean
          creado_por?: string | null
          categoria_id?: number | null
        }
      }
      pedidos: {
        Row: {
          id: number // SERIAL
          usuario_id: string | null // UUID
          fecha: string
          tipo_pago: string
          estado: string
          envio_direccion: string | null
          total: number | null // NUMERIC(10,2)
        }
        Insert: {
          id?: number
          usuario_id?: string | null
          fecha?: string
          tipo_pago: string
          estado?: string
          envio_direccion?: string | null
          total?: number | null
        }
        Update: {
          id?: number
          usuario_id?: string | null
          fecha?: string
          tipo_pago?: string
          estado?: string
          envio_direccion?: string | null
          total?: number | null
        }
      }
      detalle_pedido: {
        Row: {
          id: number // SERIAL
          pedido_id: number | null
          producto_id: number | null
          cantidad: number
          precio_unitario: number // NUMERIC(10,2)
          tipo_producto: "propio" | "dropshipping" | null
        }
        Insert: {
          id?: number
          pedido_id?: number | null
          producto_id?: number | null
          cantidad: number
          precio_unitario: number
          tipo_producto?: "propio" | "dropshipping" | null
        }
        Update: {
          id?: number
          pedido_id?: number | null
          producto_id?: number | null
          cantidad?: number
          precio_unitario?: number
          tipo_producto?: "propio" | "dropshipping" | null
        }
      }
      notificaciones_distribuidor: {
        Row: {
          id: number // SERIAL
          pedido_id: number | null
          producto_id: number | null
          distribuidor_id: string | null // UUID
          estado: string
          fecha_envio: string
        }
        Insert: {
          id?: number
          pedido_id?: number | null
          producto_id?: number | null
          distribuidor_id?: string | null
          estado?: string
          fecha_envio?: string
        }
        Update: {
          id?: number
          pedido_id?: number | null
          producto_id?: number | null
          distribuidor_id?: string | null
          estado?: string
          fecha_envio?: string
        }
      }
      ventas_pos: {
        Row: {
          id: number // SERIAL
          admin_id: string | null // UUID
          producto_id: number | null
          cantidad: number
          precio_unitario: number // NUMERIC(10,2)
          fecha: string
          metodo_pago: string | null
        }
        Insert: {
          id?: number
          admin_id?: string | null
          producto_id?: number | null
          cantidad: number
          precio_unitario: number
          fecha?: string
          metodo_pago?: string | null
        }
        Update: {
          id?: number
          admin_id?: string | null
          producto_id?: number | null
          cantidad?: number
          precio_unitario?: number
          fecha?: string
          metodo_pago?: string | null
        }
      }
      carts: {
        Row: {
          user_id: string // UUID
          product_id: number // INTEGER
          quantity: number
          created_at: string
        }
        Insert: {
          user_id: string
          product_id: number
          quantity?: number
          created_at?: string
        }
        Update: {
          user_id?: string
          product_id?: number
          quantity?: number
          created_at?: string
        }
      }
      wishlist: {
        Row: {
          user_id: string // UUID
          product_id: number // INTEGER
          created_at: string
        }
        Insert: {
          user_id: string
          product_id: number
          created_at?: string
        }
        Update: {
          user_id?: string
          product_id?: number
          created_at?: string
        }
      }
    }
  }
}
