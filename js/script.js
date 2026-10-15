 document.addEventListener('DOMContentLoaded', function () {
      var overlay = document.getElementById('search_overlay');
      var openBtn = document.getElementById('open_search');
      var openBtnMobile = document.getElementById('open_search_mobile');
      var closeBtn = document.getElementById('search_close');
      var applyBtn = document.getElementById('search_btn');
      var input = document.getElementById('search_input');
      var loader = document.querySelector('.loader_bg');

      var hamburger = document.getElementById('hamburger_btn');
      var navList = document.querySelector('.custom_nav_list');

      var cartSidebar = document.getElementById('cart_sidebar');
      var cartOverlay = document.getElementById('cart_overlay');
      var cartClose = document.getElementById('cart_close');
      var cartBody = document.getElementById('cart_body');
      var cartTotalEl = document.getElementById('cart_total');
      var cartSend = document.getElementById('cart_send');
      var addButtons = document.querySelectorAll('.add_to_cart');
      var openCartMenu = document.getElementById('open_cart_menu');
      var floatingCart = document.getElementById('floating_cart');
      var floatingCartCount = document.getElementById('floating_cart_count');

      var toast = document.getElementById('toast');
      var toastTimer = null;

      var cart = [];

         try {
         var savedCart = localStorage.getItem('donaSucos_cart');
         if (savedCart) {
            cart = JSON.parse(savedCart);
         }
         } catch (e) {
         cart = [];
         }

         renderCart();

      function showToast(message, type) {
        toast.textContent = message;
        toast.className = 'toast show' + (type ? ' ' + type : '');
        if (toastTimer) {
          clearTimeout(toastTimer);
        }
        toastTimer = setTimeout(function () {
          toast.classList.remove('show');
        }, 3000);
      }

      function updateFloatingCount() {
        var totalQtd = cart.reduce(function (acc, item) {
          return acc + item.qtd;
        }, 0);
        floatingCartCount.textContent = totalQtd;
        if (totalQtd > 0) {
          floatingCart.classList.add('has_items');
        } else {
          floatingCart.classList.remove('has_items');
        }
      }

      function openOverlaySearch(e) {
        e.preventDefault();
        overlay.classList.add('active');
        setTimeout(function () { input.focus(); }, 100);
      }

      openBtn.addEventListener('click', openOverlaySearch);
      openBtnMobile.addEventListener('click', openOverlaySearch);

      closeBtn.addEventListener('click', function () {
        overlay.classList.remove('active');
      });

      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });

      hamburger.addEventListener('click', function () {
        var isOpen = navList.classList.toggle('open');
        hamburger.classList.toggle('is_open', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      navList.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          navList.classList.remove('open');
          hamburger.classList.remove('is_open');
          hamburger.setAttribute('aria-expanded', 'false');
        });
      });

      function openCart() {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
      }

      function closeCart() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
      }

      function saveCart() {
      try {
         localStorage.setItem('donaSucos_cart', JSON.stringify(cart));
      } catch (e) {}
      }

      function renderCart() {
        cartBody.innerHTML = '';
        if (cart.length === 0) {
          cartBody.innerHTML = '<p class="cart_empty">Nenhum item no pedido ainda.</p>';
        } else {
          cart.forEach(function (item, index) {
            var row = document.createElement('div');
            row.className = 'cart_item';
            row.innerHTML =
              '<div class="cart_item_thumb">' +
                '<img src="' + item.img + '" alt="' + item.nome + '">' +
              '</div>' +
              '<div class="cart_item_content">' +
                '<div class="cart_item_info">' +
                  '<span class="cart_item_name">' + item.nome + '</span>' +
                  '<span class="cart_item_price">R$ ' + item.preco + '</span>' +
                '</div>' +
                '<div class="cart_item_actions">' +
                  '<button type="button" class="cart_qty_btn" data-action="minus" data-index="' + index + '">−</button>' +
                  '<span class="cart_qty">' + item.qtd + '</span>' +
                  '<button type="button" class="cart_qty_btn" data-action="plus" data-index="' + index + '">+</button>' +
                  '<button type="button" class="cart_remove" data-action="remove" data-index="' + index + '">Remover</button>' +
                '</div>' +
              '</div>';
            cartBody.appendChild(row);
          });
        }
        
      var total = cart.reduce(function (acc, item) {
         return acc + (item.preco * item.qtd);
      }, 0);
      cartTotalEl.textContent = 'R$ ' + total;
      updateFloatingCount();
      saveCart();
      }

      cartBody.addEventListener('click', function (e) {
        var btn = e.target.closest('button');
        if (!btn) return;
        var action = btn.getAttribute('data-action');
        var index = parseInt(btn.getAttribute('data-index'), 10);
        if (isNaN(index)) return;

        if (action === 'plus') {
          cart[index].qtd += 1;
        } else if (action === 'minus') {
          cart[index].qtd -= 1;
          if (cart[index].qtd <= 0) {
            cart.splice(index, 1);
          }
        } else if (action === 'remove') {
          cart.splice(index, 1);
        }
        renderCart();
      });

      addButtons.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var nome = btn.getAttribute('data-produto');
          var preco = parseFloat(btn.getAttribute('data-preco'));
          var img = btn.getAttribute('data-img');
          var existing = cart.find(function (item) {
            return item.nome === nome;
          });
          if (existing) {
            existing.qtd += 1;
          } else {
            cart.push({ nome: nome, preco: preco, qtd: 1, img: img });
          }
          renderCart();
          showToast(nome + ' adicionado em pedidos!', 'success');
        });
      });

      openCartMenu.addEventListener('click', function (e) {
        e.preventDefault();
        openCart();
      });

      floatingCart.addEventListener('click', openCart);

      cartClose.addEventListener('click', closeCart);
      cartOverlay.addEventListener('click', closeCart);

      cartSend.addEventListener('click', function () {
        if (cart.length === 0) {
          return;
        }
        closeCart();
        loader.style.display = 'flex';
        loader.style.opacity = '1';
        setTimeout(function () {
          loader.style.opacity = '0';
          setTimeout(function () {
            loader.style.display = 'none';
         cart = [];
         localStorage.removeItem('donaSucos_cart');
         renderCart();
         showToast('Pedido enviado para a cozinha!', 'success');
          }, 400);
        }, 2000);
      });

      var form = document.getElementById('request');
      var feedback = document.getElementById('form_feedback');
      var feedbackTimer = null;

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var nome = form.querySelector('[name="Nome"]').value.trim();
        var email = form.querySelector('[name="Email"]').value.trim();
        var tel = form.querySelector('[name="Telefone"]').value.trim();
        var msg = form.querySelector('[name="Mensagem"]').value.trim();

        if (feedbackTimer) {
          clearTimeout(feedbackTimer);
        }

        if (!nome || !email || !tel || !msg) {
          feedback.textContent = 'Todos os campos são obrigatórios.';
          feedback.classList.add('error');
          feedback.classList.remove('success');
        } else {
          feedback.textContent = 'Mensagem enviada com sucesso!';
          feedback.classList.add('success');
          feedback.classList.remove('error');
          form.reset();
        }

        feedbackTimer = setTimeout(function () {
          feedback.textContent = '';
          feedback.classList.remove('error');
          feedback.classList.remove('success');
        }, 3000);
      });

      function triggerLoader() {
        overlay.classList.remove('active');
        loader.style.display = 'flex';
        loader.style.opacity = '1';
        setTimeout(function () {
          loader.style.opacity = '0';
          setTimeout(function () {
            loader.style.display = 'none';
          }, 400);
        }, 2000);
      }

      applyBtn.addEventListener('click', triggerLoader);

      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          triggerLoader();
        }
      });
    });