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
   
3. Copy config.js to 'public/javascripts/config.js'

   - config.js은 민경에게...

4. Run Project
   ```
   $ npm start
   ```
   then open: 0.0.0.0:3000/
   
5. Clone the sub project into another folder:
   ```
   $ git clone https://github.com/Hyun-Ji/toolChamber.git
   $ cd toolChamber
   ```
   
6. Start Etherpad and Canvas server (Make sure this servers are running while you run the main project!):
   ```
   $ cd canvas
   $ npm install
   $ node server.js
   ```  
   ```
   // run this in another shell
   $ cd etherpad-lite
   $ bin/run.sh
   ```
   
++ How to make SSL cert files
   ```
   $ openssl genrsa 1024 > key.pem    // RSA-1024 알고리즘으로 키를 생성한다
   $ openssl req -x509 -new -key key.pem > cert.pem    // 이후 인증서를 만드는 기관에 대한 정보를 입력하는데, 자신의 정보를 입력하면 된다
   ```
