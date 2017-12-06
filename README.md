# magical-chamber
SW Maestro 8th.
Team Redpoint
:smile:민경, 지윤, 현지:smile:


1. Clone the main project:

   ```
   $ git clone https://github.com/2dayistheday/magical-chamber.git
   $ cd magical-chamber
   ```

2. Set up

   ```
   $ npm install
   ```


3. Run Project
   ```
   $ npm start
   ```
   then open: https://localhost:3000/
   
   
++ How to make SSL cert files
   ```
   $ mkdir cert    // create new folder in the project root folder
   $ cd cert
   $ openssl genrsa 1024 > key.pem    // RSA-1024 알고리즘으로 키를 생성한다
   $ openssl req -x509 -new -key key.pem > cert.pem    // 이후 인증서를 만드는 기관에 대한 정보를 입력하는데, 자신의 정보를 입력하면 된다
   ```

++ How to make config files
   ```
   $ mkdir config
   $ cd config
   ```
   * file list
   config/db_info.js
   ```
   module.exports = (function () {
     return{
       rds:{
         host: '',
         port: '',
         user: '',
         database: '',
         password: ''
       }
     }
   })();
   ```

   config/keys.js
   ```
   module.exports = {
     googleClientID: '',
     googleClientSecret: '',
     cookieKey: '',
     facebookClientID: '',
     facebookClientSecret: '',
     awsBucketName: '',
   };
   ```