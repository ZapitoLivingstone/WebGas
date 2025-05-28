-- Políticas de seguridad para la tienda Gásfiter Pro
-- Este archivo configura las políticas de Row Level Security (RLS) para cada tabla
-- según los roles de usuario: cliente, admin, distribuidor y usuarios no autenticados

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones_distribuidor ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas_pos ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Crear función para verificar rol de usuario
CREATE OR REPLACE FUNCTION auth.user_has_role(required_role text)
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND rol = required_role
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear función para verificar si el usuario es admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN auth.user_has_role('admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear función para verificar si el usuario es distribuidor
CREATE OR REPLACE FUNCTION auth.is_distributor()
RETURNS boolean AS $$
BEGIN
  RETURN auth.user_has_role('distribuidor');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- POLÍTICAS PARA TABLA USUARIOS
-- =============================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Usuarios pueden ver su propio perfil" ON usuarios
  FOR SELECT USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON usuarios
  FOR UPDATE USING (auth.uid() = id);

-- Los administradores pueden ver todos los usuarios
CREATE POLICY "Administradores pueden ver todos los usuarios" ON usuarios
  FOR SELECT USING (auth.is_admin());

-- Los administradores pueden actualizar todos los usuarios
CREATE POLICY "Administradores pueden actualizar todos los usuarios" ON usuarios
  FOR UPDATE USING (auth.is_admin());

-- Los administradores pueden insertar usuarios
CREATE POLICY "Administradores pueden insertar usuarios" ON usuarios
  FOR INSERT WITH CHECK (auth.is_admin());

-- =============================================
-- POLÍTICAS PARA TABLA CATEGORÍAS
-- =============================================

-- Cualquiera puede ver las categorías
CREATE POLICY "Cualquiera puede ver las categorías" ON categorias
  FOR SELECT USING (true);

-- Solo administradores pueden gestionar categorías
CREATE POLICY "Solo administradores pueden gestionar categorías" ON categorias
  FOR ALL USING (auth.is_admin());

-- =============================================
-- POLÍTICAS PARA TABLA PRODUCTOS
-- =============================================

-- Cualquiera puede ver productos activos
CREATE POLICY "Cualquiera puede ver productos activos" ON productos
  FOR SELECT USING (activo = true);

-- Administradores pueden ver todos los productos (incluso inactivos)
CREATE POLICY "Administradores pueden ver todos los productos" ON productos
  FOR SELECT USING (auth.is_admin());

-- Administradores pueden gestionar todos los productos
CREATE POLICY "Administradores pueden gestionar todos los productos" ON productos
  FOR INSERT WITH CHECK (auth.is_admin());

CREATE POLICY "Administradores pueden actualizar productos" ON productos
  FOR UPDATE USING (auth.is_admin());

CREATE POLICY "Administradores pueden eliminar productos" ON productos
  FOR DELETE USING (auth.is_admin());

-- Distribuidores pueden ver productos dropshipping
CREATE POLICY "Distribuidores pueden ver productos dropshipping" ON productos
  FOR SELECT USING (tipo = 'dropshipping' AND auth.is_distributor());

-- =============================================
-- POLÍTICAS PARA TABLA PEDIDOS
-- =============================================

-- Clientes pueden ver sus propios pedidos
CREATE POLICY "Clientes pueden ver sus propios pedidos" ON pedidos
  FOR SELECT USING (auth.uid() = usuario_id);

-- Clientes pueden crear sus propios pedidos
CREATE POLICY "Clientes pueden crear sus propios pedidos" ON pedidos
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Administradores pueden ver y gestionar todos los pedidos
CREATE POLICY "Administradores pueden ver todos los pedidos" ON pedidos
  FOR SELECT USING (auth.is_admin());

CREATE POLICY "Administradores pueden actualizar pedidos" ON pedidos
  FOR UPDATE USING (auth.is_admin());

-- Distribuidores pueden ver pedidos con sus productos
CREATE POLICY "Distribuidores pueden ver pedidos relacionados" ON pedidos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM notificaciones_distribuidor
      WHERE pedido_id = pedidos.id AND distribuidor_id = auth.uid()
    )
  );

-- =============================================
-- POLÍTICAS PARA TABLA DETALLE_PEDIDO
-- =============================================

-- Clientes pueden ver detalles de sus pedidos
CREATE POLICY "Clientes pueden ver detalles de sus pedidos" ON detalle_pedido
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pedidos
      WHERE id = detalle_pedido.pedido_id AND usuario_id = auth.uid()
    )
  );

-- Clientes pueden crear detalles para sus pedidos
CREATE POLICY "Clientes pueden crear detalles para sus pedidos" ON detalle_pedido
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pedidos
      WHERE id = detalle_pedido.pedido_id AND usuario_id = auth.uid()
    )
  );

-- Administradores pueden gestionar todos los detalles
CREATE POLICY "Administradores pueden gestionar todos los detalles" ON detalle_pedido
  FOR ALL USING (auth.is_admin());

-- Distribuidores pueden ver detalles de pedidos relacionados
CREATE POLICY "Distribuidores pueden ver detalles relacionados" ON detalle_pedido
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM notificaciones_distribuidor nd
      JOIN pedidos p ON p.id = nd.pedido_id
      WHERE detalle_pedido.pedido_id = p.id AND nd.distribuidor_id = auth.uid()
    )
  );

-- =============================================
-- POLÍTICAS PARA TABLA NOTIFICACIONES_DISTRIBUIDOR
-- =============================================

-- Distribuidores pueden ver sus notificaciones
CREATE POLICY "Distribuidores pueden ver sus notificaciones" ON notificaciones_distribuidor
  FOR SELECT USING (distribuidor_id = auth.uid());

-- Distribuidores pueden actualizar sus notificaciones
CREATE POLICY "Distribuidores pueden actualizar sus notificaciones" ON notificaciones_distribuidor
  FOR UPDATE USING (distribuidor_id = auth.uid());

-- Administradores pueden gestionar todas las notificaciones
CREATE POLICY "Administradores pueden gestionar todas las notificaciones" ON notificaciones_distribuidor
  FOR ALL USING (auth.is_admin());

-- =============================================
-- POLÍTICAS PARA TABLA VENTAS_POS
-- =============================================

-- Solo administradores pueden gestionar ventas POS
CREATE POLICY "Solo administradores pueden gestionar ventas POS" ON ventas_pos
  FOR ALL USING (auth.is_admin());

-- =============================================
-- POLÍTICAS PARA TABLA CARTS
-- =============================================

-- Usuarios pueden gestionar su propio carrito
CREATE POLICY "Usuarios pueden gestionar su propio carrito" ON carts
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- POLÍTICAS PARA TABLA WISHLIST
-- =============================================

-- Usuarios pueden gestionar su propia lista de deseos
CREATE POLICY "Usuarios pueden gestionar su propia wishlist" ON wishlist
  FOR ALL USING (auth.uid() = user_id);
