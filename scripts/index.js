//CAROL TORREZ
// Podria levantar los productos de un JSON o directamente estar escritos aca

let productos = [];
let productoTienda;
let carritocompra; 

fetch('productos.json')
  .then(res => {
    if (!res.ok) {
      throw new Error('Error al cargar productos');
    }
    return res.json();
  })
  .then(data => {
    productos = data;
    productoTienda = new ProductoTienda(productos);
    
    carritocompra = new CarritoDeCompras(); 
    
    renderProductos(productos);
    renderFiltros();
  })
  .catch(error => {
    console.error('Error cargando productos:', error);
    alert('Error al cargar los productos. Por favor, recarga la página.');
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
    boton.addEventListener("click", () => {carritocompra.agregarProducto(prod.id)});

    div.appendChild(boton);
    contenedor.appendChild(div);
  });
}



//FILTROS
function renderFiltros() {
  const contenedor = document.querySelector(".filtros");
  contenedor.innerHTML = "";

//RANGO

const inputMin = document.createElement("input");
inputMin.type = "number";
inputMin.id = "minPrecio";
inputMin.placeholder = "Precio mínimo";

const inputMax = document.createElement("input");
inputMax.type = "number";
inputMax.id = "maxPrecio";
inputMax.placeholder = "Precio máximo";

const btnRango = document.createElement("button");
btnRango.textContent = "Aplicar Filtro";
btnRango.classList.add("btn-aplicar-filtro");
btnRango.onclick = filtrarPorRango; 

contenedor.appendChild(inputMin);
contenedor.appendChild(inputMax);
contenedor.appendChild(btnRango);


const categorias = [...new Set(productos.map(p => p.categoria?.trim()).filter(Boolean))].sort();


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

// CLASE NOTIFICACION
class Notificacion {
  static mostrar(mensaje, tipo = "success") {
   
    const notif = document.createElement("div");
    notif.className = `notificacion ${tipo}`;
    notif.textContent = mensaje;
    
    notif.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      font-weight: bold;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
      ${tipo === "error" ? "background-color: #e74c3c;" : 
        tipo === "info" ? "background-color: #3498db;" : 
        "background-color: #2ecc71;"}
    `;
    
    document.body.appendChild(notif);
    setTimeout(() => notif.style.opacity = "1", 100);
    setTimeout(() => {
      notif.style.opacity = "0";
      setTimeout(() => document.body.removeChild(notif), 300);
    }, 3000);
  }
}

class CarritoDeCompras {
  
    constructor() {
        this.items = this.cargarDesdeTienda();
    }

    //CARGAR CARRITO (SIN PERSISTENCIA)
    cargarDesdeTienda() {
       
        return [];
    }

    //GUARDAR CARRITO (SIN PERSISTENCIA)
    guardarEnTienda() {
      this.actualizarResumen();
    }

    //AGREGAR PRODUCTO
    agregarProducto(id) {
        const producto = productoTienda.obtenerProducto(id);
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

        this.actualizarResumen();
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
        this.actualizarResumen();
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
    this.actualizarResumen();
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
        this.actualizarResumen();
    }

    // ACTUALIZACIÓN DEL CARRITO
    actualizarResumen() {
        const carritoItems = document.getElementById("carritoItems");
        const carritoTotal = document.getElementById("carritoTotal");
        
        if (carritoItems) carritoItems.textContent = this.getTotalItems();
        if (carritoTotal) carritoTotal.textContent = this.getTotalPrecio().toLocaleString();
    }
}

//MODAL

class ModalCompra {
  static abrirCarrito() {
    const modal = document.getElementById("modalCarrito");
    const contenido = document.getElementById("contenidoCarrito");
    const total = document.getElementById("totalCarrito");

    if (!modal || !contenido || !total) {
      console.error('Elementos del modal no encontrados');
      return;
    }

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
        <span>
        <button class="btn-restar" data-id="${item.id}">–</button>${item.cantidad}
        <button class="btn-sumar" data-id="${item.id}">+</button></span>
        <span>$${(item.precio * item.cantidad).toLocaleString()}</span>
        
        </div>
        `;

        contenido.innerHTML += itemHTML;
      });

      total.textContent = `Total: $${carritocompra.getTotalPrecio().toLocaleString()}`;

      contenido.querySelectorAll('.btn-sumar').forEach(btn => {
      btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      carritocompra.incrementarCantidad(id);
      ModalCompra.abrirCarrito(); 
  });
});

  contenido.querySelectorAll('.btn-restar').forEach(btn => {
  btn.addEventListener('click', () => {
  const id = parseInt(btn.dataset.id);
  carritocompra.decrementarCantidad(id);
  ModalCompra.abrirCarrito(); 
  });
});

    }
  }

  static cerrarCarrito() {
    const modal = document.getElementById("modalCarrito");
    if (modal) {
      document.body.style.overflow = "auto";
      modal.style.display = "none";
    }
  }
}

function verCarrito() {
  ModalCompra.abrirCarrito();
}

document.addEventListener("DOMContentLoaded", () => {
  const vaciar = document.getElementById("btnVaciarCarrito");
  if (vaciar) {
    vaciar.addEventListener("click", () => {
      carritocompra.vaciarCarrito();
      ModalCompra.abrirCarrito(); 
      Notificacion.mostrar("El carrito fue vaciado", "info");
    });
  }
});

