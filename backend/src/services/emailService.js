const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_USER || '',
        pass: process.env.ETHEREAL_PASS || '',
      },
    });
  }
  return transporter;
};

const enviarCorreoPedido = async (pedido) => {
  try {
    const mail = getTransporter();
    const isEthereal = !process.env.SMTP_HOST;

    const itemsHtml = pedido.items.map(item =>
      `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee">${item.nombre_producto}</td>
       <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center">${item.cantidad}</td>
       <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">$${Number(item.subtotal).toLocaleString('es-CO')}</td></tr>`
    ).join('');

    const html = `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#FDF6EC;border-radius:16px;overflow:hidden;border:1px solid #F2D4C2">
        <div style="background:#C97B5A;padding:24px;text-align:center">
          <h1 style="color:#fff;margin:0;font-family:Georgia,serif">🎂 La Flor de Azúcar</h1>
          <p style="color:#FFF3CD;margin:4px 0 0">Repostería Artesanal</p>
        </div>
        <div style="padding:24px">
          <h2 style="color:#3A2510;margin-top:0">✅ Pedido confirmado</h2>
          <p style="color:#5A4030">Hola <strong>${pedido.cliente_nombre}</strong>, tu pedido ha sido registrado exitosamente.</p>
          <div style="text-align:center;margin:24px 0">
            <div style="font-size:2rem;font-weight:700;letter-spacing:.15em;color:#3A2510">${pedido.codigo}</div>
            <p style="color:#9A7B60;font-size:.85rem;margin:4px 0">Código de pedido</p>
          </div>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <thead><tr style="background:#F2D4C2;color:#3A2510">
              <th style="padding:8px 12px;text-align:left">Producto</th>
              <th style="padding:8px 12px">Cant.</th>
              <th style="padding:8px 12px;text-align:right">Total</th>
            </tr></thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr><td colspan="2" style="padding:8px 12px;text-align:right;font-weight:600">Subtotal</td>
                <td style="padding:8px 12px;text-align:right">$${Number(pedido.subtotal).toLocaleString('es-CO')}</td></tr>
              <tr><td colspan="2" style="padding:8px 12px;text-align:right;font-weight:600">IVA 16%</td>
                <td style="padding:8px 12px;text-align:right">$${Number(pedido.impuesto).toLocaleString('es-CO')}</td></tr>
              <tr style="font-size:1.1rem"><td colspan="2" style="padding:8px 12px;text-align:right;font-weight:700;color:#C97B5A">TOTAL</td>
                <td style="padding:8px 12px;text-align:right;font-weight:700;color:#C97B5A">$${Number(pedido.total).toLocaleString('es-CO')}</td></tr>
            </tfoot>
          </table>
          <hr style="border:1px solid #F2D4C2;margin:20px 0">
          <p style="color:#5A4030;margin:6px 0"><strong>Entrega:</strong> ${pedido.tipo_entrega === 'domicilio' ? '🚚 A domicilio' : '🏪 Recoger en tienda'}</p>
          <p style="color:#5A4030;margin:6px 0"><strong>Pago:</strong> ${pedido.metodo_pago}</p>
          <p style="color:#5A4030;margin:6px 0"><strong>Dirección:</strong> ${pedido.direccion_entrega || 'N/A'}</p>
          <p style="color:#9A7B60;font-size:.85rem;margin-top:20px">Presenta este código al recoger tu pedido. ¡Gracias por elegirnos! 🌸</p>
        </div>
      </div>`;

    const info = await mail.sendMail({
      from: `"La Flor de Azúcar" <${process.env.SMTP_USER || 'no-reply@laflordeazucar.com'}>`,
      to: pedido.cliente_email || 'cliente@email.com',
      subject: `✅ Pedido ${pedido.codigo} confirmado - La Flor de Azúcar`,
      html,
    });

    if (isEthereal) console.log('📧 Vista previa en Ethereal:', nodemailer.getTestMessageUrl(info));
    return info;
  } catch (err) {
    console.error('Error al enviar email:', err.message);
    return null;
  }
};

const enviarCorreoEstado = async (pedido) => {
  try {
    const mail = getTransporter();
    const estadosMsg = {
      confirmado: 'ha sido confirmado y estamos revisando los ingredientes.',
      preparando: 'está siendo preparado con todo el amor 🎂',
      listo: 'está listo para recoger o enviar 🎉',
      entregado: 'ha sido entregado. ¡Disfrútalo! 🌸',
      cancelado: 'ha sido cancelado. Contáctanos para más información.',
    };
    const msg = estadosMsg[pedido.estado] || 'ha actualizado su estado.';

    const html = `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#FDF6EC;border-radius:16px;overflow:hidden;border:1px solid #F2D4C2">
        <div style="background:#C97B5A;padding:24px;text-align:center">
          <h1 style="color:#fff;margin:0;font-family:Georgia,serif">🎂 La Flor de Azúcar</h1>
        </div>
        <div style="padding:24px;text-align:center">
          <h2 style="color:#3A2510">📦 Pedido ${pedido.estado}</h2>
          <p style="color:#5A4030">Tu pedido <strong>${pedido.codigo}</strong> ${msg}</p>
          <p style="color:#9A7B60;font-size:.85rem;margin-top:20px">Gracias por confiar en La Flor de Azúcar 🌸</p>
        </div>
      </div>`;

    await mail.sendMail({
      from: `"La Flor de Azúcar" <${process.env.SMTP_USER || 'no-reply@laflordeazucar.com'}>`,
      to: pedido.cliente_email,
      subject: `📦 Pedido ${pedido.codigo} ${pedido.estado} - La Flor de Azúcar`,
      html,
    });
  } catch (err) {
    console.error('Error al enviar email de estado:', err.message);
  }
};

module.exports = { enviarCorreoPedido, enviarCorreoEstado };