/* =========================================================
   Menú del comedor, mes a mes.
   ---------------------------------------------------------
   Los datos salen del PDF que firma el centro y que está en
   /assets/docs/. Para cambiar de mes: sustituye el PDF, pon
   aquí los días nuevos y actualiza MES y ARCHIVO.

   Cada día: primero, segundo, guarnicion, postre, postre2
   (solo guardería), bebida, pan y los valores nutricionales
   que da el propio menú (kcal, prot, lip, hc).
   ========================================================= */
window.NSD_MENU = {
  mes: 'Septiembre de 2026',
  archivo: '/assets/docs/menu-comedor-septiembre-2026.pdf',
  nombreDescarga: 'Menu-comedor-septiembre-2026-Colegio-NSD.pdf',
  paginas: 2,
  peso: '0,9 MB',
  dias: [
    { fecha: '2026-09-01', primero: "Macarrones integrales con salsa de tomate", segundo: "Filete de pollo a la plancha", guarnicion: "Champiñones rehogados", postre: "Fruta natural", bebida: "Agua", pan: "Pan blanco", kcal: 573, prot: 36, lip: 9, hc: 82 },
    { fecha: '2026-09-02', primero: "Crema de verduras", segundo: "Tortilla francesa", guarnicion: "Guisantes rehogados", postre: "Yogur natural", bebida: "Agua", pan: "Pan Integral", kcal: 701, prot: 31, lip: 22, hc: 90 },
    { fecha: '2026-09-03', primero: "Patatas guisadas", segundo: "Cinta de lomo de cerdo a la plancha", guarnicion: "Ensalada de lechuga", postre: "Fruta natural", bebida: "Agua", pan: "Pan blanco", kcal: 642, prot: 40, lip: 20, hc: 68 },
    { fecha: '2026-09-04', primero: "Lentejas guisadas con arroz", segundo: "Filete de merluza al horno", guarnicion: "Ensalada de tomate natural", postre: "Fruta natural", postre2: "Leche sola", bebida: "Agua", pan: "Pan Integral", kcal: 672, prot: 33, lip: 18, hc: 88 },
    { fecha: '2026-09-07', primero: "Espaguetis integrales con salsa de tomate", segundo: "Tortilla de patata", guarnicion: "Ensalada de pimientos rojos", postre: "Fruta natural", postre2: "Leche sola", bebida: "Agua", pan: "Pan blanco", kcal: 774, prot: 21, lip: 21, hc: 117 },
    { fecha: '2026-09-08', primero: "Judías blancas guisadas con verduras", segundo: "Bacalao rebozado", guarnicion: "Ensalada de lechuga, tomate, maíz y atún", postre: "Fruta natural", bebida: "Agua", pan: "Pan blanco", kcal: 949, prot: 54, lip: 14, hc: 132 },
    { fecha: '2026-09-09', primero: "Crema de espinacas", segundo: "Pollo en salsa (cebolla, ajo, perejil)", guarnicion: "Guisantes rehogados", postre: "Yogur natural", bebida: "Agua", pan: "Pan Integral", kcal: 663, prot: 41, lip: 15, hc: 87 },
    { fecha: '2026-09-10', primero: "Paella de arroz con verduras y carne de pollo", segundo: "Filete de merluza al horno", guarnicion: "Champiñones rehogados", postre: "Fruta natural", bebida: "Agua", pan: "Pan blanco", kcal: 595, prot: 30, lip: 12, hc: 84 },
    { fecha: '2026-09-11', primero: "Potaje de garbanzos y verduras", segundo: "Hamburguesas de pollo", guarnicion: "Rodajas de tomate natural", postre: "Fruta natural", postre2: "Leche sola", bebida: "Agua", pan: "Pan Integral", kcal: 640, prot: 41, lip: 17, hc: 73 },
    { fecha: '2026-09-14', primero: "Macarrones integrales con salsa de tomate", segundo: "Huevos fritos", guarnicion: "Pisto (verduras guisadas)", postre: "Fruta natural", postre2: "Leche sola", bebida: "Agua", pan: "Pan blanco", kcal: 660, prot: 25, lip: 31, hc: 67 },
    { fecha: '2026-09-15', primero: "Sopa de cocido con fideos ECO", segundo: "Cocido completo (garbanzos, carne, verdura)", guarnicion: "", postre: "Fruta natural", bebida: "Agua", pan: "Pan blanco", kcal: 798, prot: 29, lip: 15, hc: 134 },
    { fecha: '2026-09-16', primero: "Patatas guisadas", segundo: "Filete de palometa al horno", guarnicion: "Menestra de verduras guisadas", postre: "Yogur natural", bebida: "Agua", pan: "Pan Integral", kcal: 641, prot: 34, lip: 17, hc: 83 },
    { fecha: '2026-09-17', primero: "Judías verdes rehogadas", segundo: "Pollo en salsa (cebolla, ajo, perejil)", guarnicion: "Ensalada de tomate natural", postre: "Fruta natural", bebida: "Agua", pan: "Pan blanco", kcal: 543, prot: 32, lip: 9, hc: 77 },
    { fecha: '2026-09-18', primero: "Judías pintas guisadas con verduras", segundo: "Filete de merluza al horno", guarnicion: "Ensalada de lechuga", postre: "Fruta natural", postre2: "Leche sola", bebida: "Agua", pan: "Pan Integral", kcal: 744, prot: 44, lip: 7, hc: 119 },
    { fecha: '2026-09-21', primero: "Espaguetis integrales con salsa de tomate", segundo: "Pollo en salsa (cebolla, ajo, perejil)", guarnicion: "Guisantes rehogados", postre: "Fruta natural", postre2: "Leche sola", bebida: "Agua", pan: "Pan blanco", kcal: 647, prot: 39, lip: 8, hc: 98 },
    { fecha: '2026-09-22', primero: "Crema de verduras", segundo: "Filete de palometa al horno", guarnicion: "Ensalada de arroz y atún", postre: "Fruta natural", bebida: "Agua", pan: "Pan blanco", kcal: 873, prot: 44, lip: 18, hc: 146 },
    { fecha: '2026-09-23', primero: "Sopa de cocido con fideos ECO", segundo: "Cocido completo (garbanzos, carne, verdura)", guarnicion: "", postre: "Yogur natural", bebida: "Agua", pan: "Pan Integral", kcal: 856, prot: 33, lip: 16, hc: 143 },
    { fecha: '2026-09-24', primero: "Puré de zanahorias", segundo: "Tortilla francesa", guarnicion: "Patatas fritas", postre: "Fruta natural", bebida: "Agua", pan: "Pan blanco", kcal: 853, prot: 22, lip: 36, hc: 104 },
    { fecha: '2026-09-25', primero: "Patatas guisadas", segundo: "Filete de merluza al horno", guarnicion: "Ensalada de lechuga", postre: "Fruta natural", postre2: "Leche sola", bebida: "Agua", pan: "Pan Integral", kcal: 525, prot: 26, lip: 10, hc: 72 },
    { fecha: '2026-09-28', primero: "Macarrones integrales con salsa de tomate", segundo: "Huevos cocidos", guarnicion: "Pisto (verduras guisadas)", postre: "Fruta natural", postre2: "Leche sola", bebida: "Agua", pan: "Pan blanco", kcal: 605, prot: 21, lip: 17, hc: 85 },
    { fecha: '2026-09-29', primero: "Judías verdes rehogadas", segundo: "Pollo en salsa (cebolla, ajo, perejil)", guarnicion: "Guisantes rehogados", postre: "Fruta natural", bebida: "Agua", pan: "Pan blanco", kcal: 560, prot: 36, lip: 8, hc: 81 },
    { fecha: '2026-09-30', primero: "Sopa de picadillo con fideos (tropezones de jamón y pollo)", segundo: "Filete de merluza al horno", guarnicion: "Ensalada de lechuga, tomate, zanahoria, maíz y atún", postre: "Yogur natural", bebida: "Agua", pan: "Pan Integral", kcal: 720, prot: 43, lip: 10, hc: 90 },
  ],
};
