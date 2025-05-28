-- Enable Row Level Security (RLS) on all tables
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones_distribuidor ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas_pos ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla usuarios
CREATE POLICY "Users can view their own profile" ON usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON usuarios
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON usuarios
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Políticas para la tabla categorias
CREATE POLICY "Anyone can view categories" ON categorias
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage categories" ON categorias
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Políticas para la tabla productos
CREATE POLICY "Anyone can view active products" ON productos
  FOR SELECT USING (activo = true);

CREATE POLICY "Admins can manage all products" ON productos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Políticas para la tabla pedidos
CREATE POLICY "Users can view their own orders" ON pedidos
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create their own orders" ON pedidos
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Admins can view all orders" ON pedidos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

CREATE POLICY "Admins can update orders" ON pedidos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Políticas para la tabla detalle_pedido
CREATE POLICY "Users can view their order details" ON detalle_pedido
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pedidos 
      WHERE id = pedido_id AND usuario_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order details for their orders" ON detalle_pedido
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pedidos 
      WHERE id = pedido_id AND usuario_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all order details" ON detalle_pedido
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Políticas para la tabla notificaciones_distribuidor
CREATE POLICY "Distributors can view their notifications" ON notificaciones_distribuidor
  FOR SELECT USING (auth.uid() = distribuidor_id);

CREATE POLICY "Distributors can update their notifications" ON notificaciones_distribuidor
  FOR UPDATE USING (auth.uid() = distribuidor_id);

CREATE POLICY "Admins can manage all notifications" ON notificaciones_distribuidor
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Políticas para la tabla ventas_pos
CREATE POLICY "Admins can manage POS sales" ON ventas_pos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- Políticas para la tabla carts
CREATE POLICY "Users can manage their own cart" ON carts
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para la tabla wishlist
CREATE POLICY "Users can manage their own wishlist" ON wishlist
  FOR ALL USING (auth.uid() = user_id);
