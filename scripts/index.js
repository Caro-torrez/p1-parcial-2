//CAROL TORREZ
// Podria levantar los productos de un JSON o directamente estar escritos aca

let productos = [];
let productoTienda;
let carritocompra; // 💡 declarada arriba pero sin instanciar aún

fetch('productos.json')
  .then(res => res.json())
  .then(data => {
    productos = data;
    productoTienda = new ProductoTienda(productos);
    console.log("✅ productoTienda instanciado:", productoTienda);
    carritocompra = new CarritodeCompras(); // ✅ instanciada después
    console.log("✅ carritocompra instanciado con items:", carritocompra.items);
    renderProductos(productos);
    renderFiltros();
  });


function renderProductos(productos) {
  const contenedor = document.getElementById('contenedor-productos');
  contenedor.innerHTML = '';

  productos.forEach(prod => {
    const div = document.createElement('div');
    div.classList.add('producto');

    div.innerHTML = `
    <h3>${prod.nombre}</h3>
      <img src="${prod.imagen}" alt="${prod.nombre}">
      <p class="descripcion">${prod.descripcion}</p>
      <p class="precio">Precio: $${prod.precio}</p>
    `;

    const boton = document.createElement("button");
    boton.textContent = "Agregar al carrito";
    boton.addEventListener("click", () => {console.log(`🖱️ Se hizo clic en agregar al carrito: ${prod.nombre}`);carritocompra.agregarProducto(prod.id)});

    div.appendChild(boton);
    contenedor.appendChild(div);
  });
}



//FILTROS
function renderFiltros() {
  const contenedor = document.querySelector(".filtros");
  contenedor.innerHTML = "";
 // 👉 Log para verificar que productos tiene datos válidos
  console.log("Productos disponibles:", productos);

//RANGO
// Input de rango
const inputMin = document.createElement("input");
inputMin.type = "number";
inputMin.id = "minPrecio";
inputMin.placeholder = "Precio mínimo";

const inputMax = document.createElement("input");
inputMax.type = "number";
inputMax.id = "maxPrecio";
inputMax.placeholder = "Precio máximo";

// Botón para aplicar filtro
const btnRango = document.createElement("button");
btnRango.textContent = "Aplicar Filtro";
btnRango.classList.add("btn-aplicar-filtro");
btnRango.onclick = filtrarPorRango; // tu función ya existe 💪

// Agregarlos al contenedor
contenedor.appendChild(inputMin);
contenedor.appendChild(inputMax);
contenedor.appendChild(btnRango);


  const categorias = [...new Set(productos.map(p => p.categoria?.trim()))].sort();
  // 👉 Log para ver qué categorías se están extrayendo
  console.log("Categorías generadas:", categorias);

  //TODOS
  const btnTodos = document.createElement("button");
  btnTodos.textContent = "Todos";
  btnTodos.onclick = () => renderProductos(productos);
  contenedor.appendChild(btnTodos);

//MAYOR Y MENOR
  const btnAsc = document.createElement("button");
  btnAsc.textContent = "Más barato";
  btnAsc.onclick = () => ordenarPorPrecio(true);
  contenedor.appendChild(btnAsc);

  const btnDesc = document.createElement("button");
  btnDesc.textContent = "Más caro";
  btnDesc.onclick = () => ordenarPorPrecio(false);
  contenedor.appendChild(btnDesc);

  //CATEGORÍA
  categorias.forEach(cat => {
  const btn = document.createElement("button");
  btn.textContent = cat;
  btn.onclick = () => {
    const filtrados = productos.filter(p =>
  typeof p.categoria === 'string' &&
  p.categoria.trim().toLowerCase() === cat.toLowerCase()
);

    renderProductos(filtrados);
    
  };
  contenedor.appendChild(btn);
  
});

}

//MAYOR Y MENOR
function ordenarPorPrecio(asc = true) {
  const lista = [...productos].sort((a, b) => asc ? a.precio - b.precio : b.precio - a.precio);
  renderProductos(lista);
}

//RANGO
function filtrarPorRango() {
  const min = parseInt(document.getElementById("minPrecio").value) || 0;
  const max = parseInt(document.getElementById("maxPrecio").value) || Infinity;
  const filtrados = productos.filter(p => p.precio >= min && p.precio <= max);
  renderProductos(filtrados);
}



 //CARRITO 
class ProductoTienda {
  constructor(productos) {
    this.productos = productos;
  }

  obtenerProducto(id) {
    return this.productos.find(p => p.id === id);
  }

  renderProductos(productosFiltrados = this.productos) {
    renderProductos(productosFiltrados);
  }
} 

class Notificacion {
  static mostrar(mensaje, tipo = "success", duracion = 3000) {
    const contenedor = document.getElementById("notificaciones");
    if (!contenedor) return;

    const noti = document.createElement("div");
    noti.className = `notificacion ${tipo}`;
    noti.textContent = mensaje;

    contenedor.appendChild(noti);

    setTimeout(() => {
      contenedor.removeChild(noti);
    }, duracion);
  }
}
        class CarritodeCompras {
          
            constructor() {
                this.items = this.cargarDesdeTienda();
            }

            //CARGAR CARRITO
            cargarDesdeTienda() {
                const data = localStorage.getItem("carritoTienda");
                return data ? JSON.parse(data) : [];
            }

            //GUARDAR CARRITO
            guardarEnTienda() {
                localStorage.setItem("carritoTienda", JSON.stringify(this.items));
                this.actualizarResumen();
            }

            //AGREGAR PRODUCTO
            agregarProducto(id) {
                const producto = productoTienda.obtenerProducto(id);
                console.log("🛒 Producto que se quiere agregar:", producto);
                if (!producto) return;

                const itemExistente = this.items.find(item => item.id === id);
                
                if (itemExistente) {
                    if (itemExistente.cantidad < producto.stock) {
                        itemExistente.cantidad++;
                        Notificacion.mostrar(`Se añadió otro ${producto.nombre} al carrito`);
                    } else {
                        Notificacion.mostrar("No hay más stock disponible", "error");
                        return;
                    }
                } else {
                    this.items.push({ ...producto, cantidad: 1 });
                    Notificacion.mostrar(`${producto.nombre} añadido al carrito`);
                }

                this.guardarEnTienda();
                productoTienda.renderProductos();
            }

//AUMENTAR CANTIDAD
incrementarCantidad(id) {
  const producto = productoTienda.obtenerProducto(id);
  if (!producto) return;

  this.items.forEach(item => {
    if (item.id === id) {
      if (item.cantidad < producto.stock) {
        item.cantidad++;
        this.guardarEnTienda();
      } else {
        Notificacion.mostrar("No hay más stock disponible", "error");
      }
    }
  });
}


 //RESTAR CANTIDAD
  decrementarCantidad(id) {
  let index = -1;

  this.items.forEach((item, i) => {
    if (item.id === id) {
      index = i;
    }
  });

  if (index > -1) {
    if (this.items[index].cantidad > 1) {
      this.items[index].cantidad--;
    } else {
      this.items.splice(index, 1);
    }
    this.guardarEnTienda();
  }
}


            //CANTIDAD EN EL CARRITO
            obtenerCantidadEnCarrito(id) {
                const item = this.items.find(item => item.id === id);
                return item ? item.cantidad : 0;
            }

            //TOTAL DE ITEMS
            getTotalItems() {
                return this.items.reduce((total, item) => total + item.cantidad, 0);
            }

            //TOTAL DEL PRECIO
            getTotalPrecio() {
                return this.items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
            }

            //VACIAR CARRITO
            vaciarCarrito() {
                this.items = [];
                this.guardarEnTienda();
            }

            // ACTUALIZACIÓN DEL CARRITO
            actualizarResumen() {
                document.getElementById("carritoItems").textContent = this.getTotalItems();
                document.getElementById("carritoTotal").textContent = this.getTotalPrecio().toLocaleString();
            }
        }

//MODAL

class Modalcompra {
  static abrirCarrito() {
    const modal = document.getElementById("modalCarrito");
    const contenido = document.getElementById("contenidoCarrito");
    const total = document.getElementById("totalCarrito");


    document.body.style.overflow = "hidden";
    modal.style.display = "block";
    contenido.innerHTML = "";

    if (carritocompra.items.length === 0) {
      contenido.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">Tu carrito está vacío</div>';
      total.textContent = '';
    } else {
      carritocompra.items.forEach(item => {
        const itemHTML = `
          <div class="item-carrito">
            <span>${item.nombre}</span>
            <span>Cantidad: ${item.cantidad}</span>
            <span>Precio: $${(item.precio * item.cantidad).toLocaleString()}</span>
          </div>
        `;
        contenido.innerHTML += itemHTML;
      });

      total.textContent = `Total: $${carritocompra.getTotalPrecio().toLocaleString()}`;
    }
  }

  static cerrarCarrito() {
    const modal = document.getElementById("modalCarrito");
    document.body.style.overflow = "auto";
    modal.style.display = "none";
  }
}

function verCarrito() {
  Modalcompra.abrirCarrito();
}

//DATOS
document.addEventListener("DOMContentLoaded", () => {
  const vaciar = document.getElementById("btnVaciarCarrito");
  if (vaciar) {
    vaciar.addEventListener("click", () => {
      carritocompra.vaciarCarrito();
      Modalcompra.abrirCarrito(); // refresca el contenido del modal
      Notificacion?.mostrar?.("El carrito fue vaciado", "info");
    });
  }
});

window.addEventListener("DOMContentLoaded", () => {
  localStorage.removeItem("carritoTienda");
});

