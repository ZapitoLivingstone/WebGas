export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          nombre: string
          email: string
          password_hash: string
          rol: "cliente" | "admin" | "distribuidor"
          creado_en: string
        }
        Insert: {
          id?: string
          nombre: string
          email: string
          password_hash: string
          rol: "cliente" | "admin" | "distribuidor"
          creado_en?: string
        }
        Update: {
          id?: string
          nombre?: string
          email?: string
          password_hash?: string
          rol?: "cliente" | "admin" | "distribuidor"
          creado_en?: string
        }
      }
      categorias: {
        Row: {
          id: number
          nombre: string
        }
        Insert: {
          id?: number
          nombre: string
        }
        Update: {
          id?: number
          nombre?: string
        }
      }
      productos: {
        Row: {
          id: number
          nombre: string
          descripcion: string | null
          precio: number
          stock: number | null
          imagen_url: string | null
          tipo: "propio" | "dropshipping"
          activo: boolean
          creado_por: string | null
          categoria_id: number | null
        }
        Insert: {
          id?: number
          nombre: string
          descripcion?: string | null
          precio: number
          stock?: number | null
          imagen_url?: string | null
          tipo: "propio" | "dropshipping"
          activo?: boolean
          creado_por?: string | null
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
          id: number
          usuario_id: string | null
          fecha: string
          tipo_pago: string
          estado: string
          envio_direccion: string | null
          total: number | null
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
          id: number
          pedido_id: number | null
          producto_id: number | null
          cantidad: number
          precio_unitario: number
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
          id: number
          pedido_id: number | null
          producto_id: number | null
          distribuidor_id: string | null
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
          id: number
          admin_id: string | null
          producto_id: number | null
          cantidad: number
          precio_unitario: number
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
          user_id: string
          product_id: number
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
          user_id: string
          product_id: number
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
