export function emailLayout(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#FAFAF8;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAFAF8;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border:1px solid #e8e5df;border-radius:8px;">
        <!-- Header -->
        <tr><td style="padding:32px 40px 24px;border-bottom:1px solid #e8e5df;">
          <span style="font-family:Georgia,serif;font-size:20px;font-weight:300;color:#1a1a18;letter-spacing:0.5px;">casa orfebre</span>
        </td></tr>
        <!-- Content -->
        <tr><td style="padding:32px 40px;color:#1a1a18;font-size:15px;line-height:1.6;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 40px 32px;border-top:1px solid #e8e5df;text-align:center;">
          <p style="font-size:13px;color:#4a4a48;line-height:1.6;margin:0 0 16px;">
            &iquest;Dudas o comentarios? Escr&iacute;benos a<br>
            <a href="mailto:contacto@casaorfebre.cl" style="color:#8B7355;text-decoration:none;font-weight:600;">contacto@casaorfebre.cl</a>
          </p>
          <!-- Social icons -->
          <table cellpadding="0" cellspacing="0" role="presentation" align="center" style="margin:0 auto 16px;">
            <tr>
              <td style="padding:0 5px;"><a href="https://www.instagram.com/casaorfebre" style="display:inline-block;width:32px;height:32px;line-height:32px;text-align:center;border-radius:50%;background-color:#8B7355;color:#FFFFFF;font-size:14px;text-decoration:none;" target="_blank">IG</a></td>
              <td style="padding:0 5px;"><a href="https://www.facebook.com/casaorfebre" style="display:inline-block;width:32px;height:32px;line-height:32px;text-align:center;border-radius:50%;background-color:#8B7355;color:#FFFFFF;font-size:14px;text-decoration:none;" target="_blank">Fb</a></td>
              <td style="padding:0 5px;"><a href="https://cl.pinterest.com/casaorfebre/" style="display:inline-block;width:32px;height:32px;line-height:32px;text-align:center;border-radius:50%;background-color:#8B7355;color:#FFFFFF;font-size:14px;text-decoration:none;" target="_blank">Pi</a></td>
              <td style="padding:0 5px;"><a href="https://x.com/casaorfebre" style="display:inline-block;width:32px;height:32px;line-height:32px;text-align:center;border-radius:50%;background-color:#8B7355;color:#FFFFFF;font-size:14px;text-decoration:none;" target="_blank">X</a></td>
              <td style="padding:0 5px;"><a href="https://www.tiktok.com/@casaorfebre" style="display:inline-block;width:32px;height:32px;line-height:32px;text-align:center;border-radius:50%;background-color:#8B7355;color:#FFFFFF;font-size:14px;text-decoration:none;" target="_blank">Tk</a></td>
            </tr>
          </table>
          <span style="font-size:12px;color:#9e9a90;">Casa Orfebre &middot; Joyer&iacute;a de Autor</span><br>
          <a href="https://casaorfebre.cl" style="font-size:12px;color:#8B7355;text-decoration:none;">casaorfebre.cl</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
