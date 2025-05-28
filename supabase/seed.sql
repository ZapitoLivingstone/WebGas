-- Insertar categorías de ejemplo
INSERT INTO categorias (nombre) VALUES 
('Tuberías'),
('Grifería'),
('Herramientas'),
('Accesorios'),
('Válvulas'),
('Soldadura');

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, tipo, activo, categoria_id) VALUES 
('Llave de Paso 1/2"', 'Llave de paso de bronce con rosca NPT', 15990, 25, '/placeholder.svg?height=300&width=300', 'propio', true, 1),
('Tubería PVC 110mm', 'Tubería PVC sanitaria de 110mm x 3m', 8990, 50, '/placeholder.svg?height=300&width=300', 'propio', true, 1),
('Grifo Monomando', 'Grifo monomando para lavamanos cromado', 45990, null, '/placeholder.svg?height=300&width=300', 'dropshipping', true, 2),
('Soldadura Estaño', 'Soldadura de estaño para cobre 250g', 12990, 15, '/placeholder.svg?height=300&width=300', 'propio', true, 6),
('Llave Inglesa 12"', 'Llave inglesa ajustable de 12 pulgadas', 18990, 8, '/placeholder.svg?height=300&width=300', 'propio', true, 3),
('Válvula Check 3/4"', 'Válvula antirretorno de 3/4 pulgada', 22990, null, '/placeholder.svg?height=300&width=300', 'dropshipping', true, 5),
('Codo PVC 90° 2"', 'Codo de PVC de 90 grados, 2 pulgadas', 3990, 100, '/placeholder.svg?height=300&width=300', 'propio', true, 4),
('Teflón Industrial', 'Cinta de teflón para roscas, rollo 12m', 2990, 75, '/placeholder.svg?height=300&width=300', 'propio', true, 4);

-- Crear usuario administrador de ejemplo (debes cambiar estos datos)
-- Nota: En producción, crea este usuario a través del panel de Supabase Auth
-- INSERT INTO usuarios (id, nombre, email, password_hash, rol) VALUES 
-- ('admin-uuid-here', 'Administrador', 'admin@gasfiterpro.cl', '', 'admin');
