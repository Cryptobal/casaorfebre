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
          <span style="font-size:12px;color:#9e9a90;">Casa Orfebre &middot; Joyer&iacute;a de Autor</span><br>
          <a href="https://casaorfebre.cl" style="font-size:12px;color:#8B7355;text-decoration:none;">casaorfebre.cl</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
