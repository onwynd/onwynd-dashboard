<VirtualHost \*:80>

&nbsp;   ServerAdmin webmaster@example.com

&nbsp;   DocumentRoot "/www/wwwroot/api.onwynd.com"

&nbsp;   ServerName 193ad286.api.onwynd.com

&nbsp;   ServerAlias api.onwynd.com



&nbsp;   RewriteEngine on

&nbsp;   RewriteCond %{SERVER\_PORT} !^443$

&nbsp;   RewriteRule (.\*) https://%{SERVER\_NAME}$1 \[L,R=301]



&nbsp;   <Files ~ (\\.user.ini|\\.htaccess|\\.git|\\.env|\\.svn|\\.project|LICENSE|README.md)$>

&nbsp;       Order allow,deny

&nbsp;       Deny from all

&nbsp;   </Files>



&nbsp;   <FilesMatch \\.php$>

&nbsp;       SetHandler "proxy:unix:/tmp/php-cgi-82.sock|fcgi://localhost"

&nbsp;   </FilesMatch>



&nbsp;   <Directory "/www/wwwroot/api.onwynd.com">

&nbsp;       SetOutputFilter DEFLATE

&nbsp;       Options FollowSymLinks

&nbsp;       AllowOverride All

&nbsp;       Require all granted

&nbsp;       DirectoryIndex index.php index.html index.htm default.php default.html default.htm

&nbsp;   </Directory>

</VirtualHost>



<VirtualHost \*:443>

&nbsp;   ServerAdmin webmaster@example.com

&nbsp;   DocumentRoot "/www/wwwroot/api.onwynd.com/"

&nbsp;   ServerName SSL.api.onwynd.com

&nbsp;   ServerAlias api.onwynd.com



&nbsp;   SSLEngine On

&nbsp;   SSLCertificateFile /www/server/panel/vhost/cert/api.onwynd.com/fullchain.pem

&nbsp;   SSLCertificateKeyFile /www/server/panel/vhost/cert/api.onwynd.com/privkey.pem



&nbsp;   SSLProtocol All -SSLv2 -SSLv3 -TLSv1

&nbsp;   SSLHonorCipherOrder On



&nbsp;   <FilesMatch \\.php$>

&nbsp;       SetHandler "proxy:unix:/tmp/php-cgi-82.sock|fcgi://localhost"

&nbsp;   </FilesMatch>



&nbsp;   <Files ~ (\\.user.ini|\\.htaccess|\\.git|\\.env|\\.svn|\\.project|LICENSE|README.md)$>

&nbsp;       Order allow,deny

&nbsp;       Deny from all

&nbsp;   </Files>



&nbsp;   <Directory "/www/wwwroot/api.onwynd.com/">

&nbsp;       SetOutputFilter DEFLATE

&nbsp;       Options FollowSymLinks

&nbsp;       AllowOverride All

&nbsp;       Require all granted

&nbsp;       DirectoryIndex index.php index.html index.htm default.php default.html default.htm

&nbsp;   </Directory>



&nbsp;   ProxyRequests On

&nbsp;   ProxyPreserveHost On



&nbsp;   # 🔥 REQUIRED FOR WEBSOCKETS

&nbsp;   RewriteEngine On



&nbsp;   # Handle WebSocket upgrade

&nbsp;   RewriteCond %{HTTP:Upgrade} =websocket \[NC]

&nbsp;   RewriteRule ^/app/reverb/(.\*) ws://127.0.0.1:8080/$1 \[P,L]



&nbsp;   # Handle normal HTTP fallback (Socket.IO polling)

&nbsp;   RewriteCond %{HTTP:Upgrade} !=websocket \[NC]

&nbsp;   RewriteRule ^/app/reverb/(.\*) http://127.0.0.1:8080/$1 \[P,L]



&nbsp;   RequestHeader set X-Forwarded-Proto "https"

&nbsp;   

&nbsp;   # Optional fallback (safe)

&nbsp;   ProxyPass /app/reverb http://127.0.0.1:8080

&nbsp;   ProxyPassReverse /app/reverb http://127.0.0.1:8080



&nbsp;   <Location "/api/v1/ai/chat/stream">

&nbsp;       Header set Cache-Control "no-cache"

&nbsp;       Header set Connection "keep-alive"

&nbsp;   </Location>



&nbsp;   SetEnvIfNoCase Request\_URI ^/api/v1/ai/chat/stream no-gzip=1

</VirtualHost>

