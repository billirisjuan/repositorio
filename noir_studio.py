#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime

DATA_FILE = "noir_studio_data.json"

# ─────────────────────────────────────────────
#  ESTILOS ANSI (blanco y negro)
# ─────────────────────────────────────────────
RESET  = "\033[0m"
BOLD   = "\033[1m"
DIM    = "\033[2m"
INV    = "\033[7m"   # invertido (fondo blanco, texto negro)
WHITE  = "\033[97m"
GRAY   = "\033[90m"

def clr():
    os.system("cls" if os.name == "nt" else "clear")

def line(char="─", n=52):
    print(GRAY + char * n + RESET)

def header():
    clr()
    print()
    print(BOLD + WHITE + "  ███╗   ██╗ ██████╗ ██╗██████╗ " + RESET)
    print(BOLD + WHITE + "  ████╗  ██║██╔═══██╗██║██╔══██╗" + RESET)
    print(BOLD + WHITE + "  ██╔██╗ ██║██║   ██║██║██████╔╝" + RESET)
    print(BOLD + WHITE + "  ██║╚██╗██║██║   ██║██║██╔══██╗" + RESET)
    print(BOLD + WHITE + "  ██║ ╚████║╚██████╔╝██║██║  ██║" + RESET)
    print(BOLD + WHITE + "  ╚═╝  ╚═══╝ ╚═════╝ ╚═╝╚═╝  ╚═╝" + RESET)
    print(BOLD + GRAY  + "         S T U D I O" + RESET)
    print()
    line("═")
    print()

def msg_ok(txt):
    print(BOLD + WHITE + "  ✔  " + RESET + txt)

def msg_err(txt):
    print(BOLD + "  ✖  " + RESET + txt)

def msg_info(txt):
    print(GRAY + "  ·  " + txt + RESET)

# ─────────────────────────────────────────────
#  PERSISTENCIA
# ─────────────────────────────────────────────
def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"gastos": [], "beneficios": []}

def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# ─────────────────────────────────────────────
#  DÓLAR BLUE
# ─────────────────────────────────────────────
def get_dolar_blue():
    """Consulta dólar blue desde DolarApi.com"""
    try:
        url = "https://dolarapi.com/v1/dolares/blue"
        req = urllib.request.Request(url, headers={"User-Agent": "NoirStudio/1.0"})
        with urllib.request.urlopen(req, timeout=5) as r:
            data = json.loads(r.read().decode())
            compra = data.get("compra", 0)
            venta  = data.get("venta",  0)
            fecha  = data.get("fechaActualizacion", "")[:10]
            return compra, venta, fecha
    except Exception:
        return None, None, None

# ─────────────────────────────────────────────
#  FORMATEO
# ─────────────────────────────────────────────
def fmt_ars(n):
    return f"$ {n:,.2f} ARS"

def fmt_usd(n):
    return f"U$S {n:,.2f}"

def fmt_amount(entry):
    if entry["moneda"] == "USD":
        return fmt_usd(entry["monto"])
    return fmt_ars(entry["monto"])

def fmt_ars_equiv(entry, blue_venta):
    if entry["moneda"] == "USD" and blue_venta:
        ars = entry["monto"] * blue_venta
        return f"  ≈ {fmt_ars(ars)} (blue)"
    return ""

# ─────────────────────────────────────────────
#  MENUS
# ─────────────────────────────────────────────
def pedir_moneda():
    print()
    print("  Moneda:")
    print("  " + INV + " 1 " + RESET + "  Pesos argentinos (ARS)")
    print("  " + INV + " 2 " + RESET + "  Dólar blue (USD)")
    print()
    while True:
        op = input("  Elegí [1/2]: ").strip()
        if op == "1":
            return "ARS"
        if op == "2":
            return "USD"
        msg_err("Opción inválida.")

def pedir_monto(moneda):
    while True:
        simbolo = "U$S" if moneda == "USD" else "$"
        try:
            raw = input(f"  Monto ({simbolo}): ").strip().replace(",", ".")
            monto = float(raw)
            if monto <= 0:
                msg_err("El monto debe ser mayor a 0.")
                continue
            return monto
        except ValueError:
            msg_err("Ingresá un número válido.")

def pedir_descripcion(label="Descripción"):
    while True:
        d = input(f"  {label}: ").strip()
        if d:
            return d
        msg_err("El campo no puede estar vacío.")

# ─────────────────────────────────────────────
#  ACCIONES
# ─────────────────────────────────────────────
def agregar_gasto(data):
    header()
    print(BOLD + "  NUEVO GASTO" + RESET)
    line()
    nombre = pedir_descripcion("Nombre del gasto")
    moneda = pedir_moneda()
    monto  = pedir_monto(moneda)
    ahora  = datetime.now().strftime("%Y-%m-%d %H:%M")
    entry  = {"fecha": ahora, "nombre": nombre, "monto": monto, "moneda": moneda}
    data["gastos"].append(entry)
    save_data(data)
    print()
    msg_ok(f"Gasto guardado: {nombre}  —  {fmt_amount(entry)}")
    input(GRAY + "\n  Presioná Enter para continuar..." + RESET)

def agregar_beneficio(data):
    header()
    print(BOLD + "  NUEVO BENEFICIO / INGRESO" + RESET)
    line()
    nombre = pedir_descripcion("Nombre del ingreso")
    moneda = pedir_moneda()
    monto  = pedir_monto(moneda)
    ahora  = datetime.now().strftime("%Y-%m-%d %H:%M")
    entry  = {"fecha": ahora, "nombre": nombre, "monto": monto, "moneda": moneda}
    data["beneficios"].append(entry)
    save_data(data)
    print()
    msg_ok(f"Ingreso guardado: {nombre}  —  {fmt_amount(entry)}")
    input(GRAY + "\n  Presioná Enter para continuar..." + RESET)

def ver_historial(data):
    header()
    print(BOLD + "  HISTORIAL COMPLETO" + RESET)
    line()

    # Dólar blue en vivo
    compra, venta, fecha_blue = get_dolar_blue()
    if venta:
        print(f"  Dólar blue hoy ({fecha_blue}):  compra {fmt_ars(compra)}  /  venta {fmt_ars(venta)}")
    else:
        msg_info("No se pudo obtener el dólar blue (sin conexión).")
    print()

    # Gastos
    print(BOLD + WHITE + "  GASTOS" + RESET)
    line("─", 52)
    if not data["gastos"]:
        msg_info("Sin gastos registrados.")
    else:
        for i, e in enumerate(data["gastos"], 1):
            equiv = fmt_ars_equiv(e, venta)
            print(f"  {GRAY}{i:>3}.{RESET} {e['fecha']}  {BOLD}{e['nombre']:<22}{RESET} {fmt_amount(e)}")
            if equiv:
                print(f"       {GRAY}{equiv}{RESET}")

    print()
    # Beneficios
    print(BOLD + WHITE + "  BENEFICIOS / INGRESOS" + RESET)
    line("─", 52)
    if not data["beneficios"]:
        msg_info("Sin ingresos registrados.")
    else:
        for i, e in enumerate(data["beneficios"], 1):
            equiv = fmt_ars_equiv(e, venta)
            print(f"  {GRAY}{i:>3}.{RESET} {e['fecha']}  {BOLD}{e['nombre']:<22}{RESET} {fmt_amount(e)}")
            if equiv:
                print(f"       {GRAY}{equiv}{RESET}")

    print()
    # Resumen
    line("═")
    total_gastos_ars     = sum(e["monto"] if e["moneda"] == "ARS" else (e["monto"] * (venta or 0)) for e in data["gastos"])
    total_beneficios_ars = sum(e["monto"] if e["moneda"] == "ARS" else (e["monto"] * (venta or 0)) for e in data["beneficios"])
    balance              = total_beneficios_ars - total_gastos_ars

    print(f"  Total gastos    :  {fmt_ars(total_gastos_ars)}")
    print(f"  Total ingresos  :  {fmt_ars(total_beneficios_ars)}")
    print()
    color = BOLD + WHITE if balance >= 0 else BOLD
    signo = "+" if balance >= 0 else ""
    print(f"  Balance         :  {color}{signo}{fmt_ars(balance)}{RESET}")
    if not venta:
        msg_info("(Los USD no se convirtieron: sin cotización disponible)")
    line("═")
    input(GRAY + "\n  Presioná Enter para continuar..." + RESET)

def ver_resumen_rapido(data):
    header()
    print(BOLD + "  RESUMEN RÁPIDO" + RESET)
    line()

    compra, venta, fecha_blue = get_dolar_blue()
    if venta:
        print(f"  Dólar blue ({fecha_blue}):  compra {fmt_ars(compra)}  /  venta {fmt_ars(venta)}")
    else:
        msg_info("Sin cotización disponible.")
    print()

    total_gastos_ars     = sum(e["monto"] if e["moneda"] == "ARS" else (e["monto"] * (venta or 0)) for e in data["gastos"])
    total_beneficios_ars = sum(e["monto"] if e["moneda"] == "ARS" else (e["monto"] * (venta or 0)) for e in data["beneficios"])
    balance              = total_beneficios_ars - total_gastos_ars

    print(f"  Registros de gastos   :  {len(data['gastos'])}")
    print(f"  Registros de ingresos :  {len(data['beneficios'])}")
    print()
    print(f"  Total gastos          :  {fmt_ars(total_gastos_ars)}")
    print(f"  Total ingresos        :  {fmt_ars(total_beneficios_ars)}")
    print()
    signo = "+" if balance >= 0 else ""
    print(BOLD + f"  Balance               :  {signo}{fmt_ars(balance)}" + RESET)
    line()
    input(GRAY + "\n  Presioná Enter para continuar..." + RESET)

def eliminar_registro(data):
    header()
    print(BOLD + "  ELIMINAR REGISTRO" + RESET)
    line()
    print("  ¿Qué querés eliminar?")
    print()
    print("  " + INV + " 1 " + RESET + "  Gasto")
    print("  " + INV + " 2 " + RESET + "  Ingreso")
    print("  " + INV + " 0 " + RESET + "  Volver")
    print()
    tipo = input("  Elegí [0/1/2]: ").strip()
    if tipo not in ("1", "2"):
        return
    lista = data["gastos"] if tipo == "1" else data["beneficios"]
    nombre_lista = "GASTOS" if tipo == "1" else "INGRESOS"
    if not lista:
        msg_info(f"No hay {nombre_lista.lower()} para eliminar.")
        input(GRAY + "\n  Presioná Enter..." + RESET)
        return
    print()
    print(BOLD + f"  {nombre_lista}" + RESET)
    for i, e in enumerate(lista, 1):
        print(f"  {GRAY}{i:>3}.{RESET} {e['fecha']}  {e['nombre']:<22}  {fmt_amount(e)}")
    print()
    try:
        idx = int(input("  Número a eliminar (0 para cancelar): ").strip())
        if idx == 0:
            return
        if 1 <= idx <= len(lista):
            eliminado = lista.pop(idx - 1)
            save_data(data)
            msg_ok(f"Eliminado: {eliminado['nombre']}")
        else:
            msg_err("Número fuera de rango.")
    except ValueError:
        msg_err("Ingresá un número válido.")
    input(GRAY + "\n  Presioná Enter para continuar..." + RESET)

# ─────────────────────────────────────────────
#  MENÚ PRINCIPAL
# ─────────────────────────────────────────────
def main():
    data = load_data()
    while True:
        header()
        print(BOLD + "  MENÚ PRINCIPAL" + RESET)
        line()
        print()
        print("  " + INV + " 1 " + RESET + "  Anotar gasto")
        print("  " + INV + " 2 " + RESET + "  Anotar ingreso / beneficio")
        print("  " + INV + " 3 " + RESET + "  Ver historial completo")
        print("  " + INV + " 4 " + RESET + "  Resumen rápido")
        print("  " + INV + " 5 " + RESET + "  Eliminar registro")
        print()
        line()
        print("  " + INV + " 0 " + RESET + "  Salir")
        print()
        op = input("  Elegí una opción: ").strip()

        if op == "1":
            agregar_gasto(data)
        elif op == "2":
            agregar_beneficio(data)
        elif op == "3":
            ver_historial(data)
        elif op == "4":
            ver_resumen_rapido(data)
        elif op == "5":
            eliminar_registro(data)
        elif op == "0":
            header()
            print(BOLD + WHITE + "  Hasta la próxima." + RESET)
            print()
            sys.exit(0)
        else:
            msg_err("Opción inválida. Intentá de nuevo.")
            input(GRAY + "\n  Presioná Enter..." + RESET)

if __name__ == "__main__":
    main()
