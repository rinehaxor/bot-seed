const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

async function readTelegramData(filePath) {
   try {
      const data = await fs.readFile(filePath, 'utf8');
      const lines = data.split('\n').filter((line) => line.trim() !== '');
      return lines.map((line) => line.trim());
   } catch (error) {
      console.error('Error membaca file:', error.message);
      return [];
   }
}

// Function to get profile information
async function getProfile(headers) {
   try {
      const response = await axios.get('https://elb.seeddao.org/api/v1/profile', { headers });

      if (response.status === 200) {
         console.log('Nama Akun:', response.data.data.name);
         return response.data.data.name;
      } else {
         console.log('Gagal mendapatkan profil:', response.status, response.statusText);
         return null;
      }
   } catch (error) {
      console.error('Error saat mendapatkan profil:', error.message);
      return null;
   }
}

// Function to perform the claim
async function claim(headers) {
   try {
      const response = await axios.post('https://elb.seeddao.org/api/v1/seed/claim', {}, { headers });

      if (response.status === 200) {
         console.log('Claim berhasil');
      } else if (response.status === 400) {
         console.log('Mining sedang berjalan');
      } else {
         console.log('Claim gagal:', response.status, response.statusText);
      }
   } catch (error) {
      if (error.response && error.response.status === 400) {
         console.log('Mining sedang berjalan');
      } else {
         console.error('Error saat klaim:', error.message);
      }
   }
}

// Function to process each account
async function processAccount(telegramData) {
   const headers = {
      Accept: '*/*',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'en-GB,en;q=0.9,en-US;q=0.8',
      'Cache-Control': 'no-cache',
      Origin: 'https://cf.seeddao.org',
      Pragma: 'no-cache',
      Referer: 'https://cf.seeddao.org/',
      'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Microsoft Edge";v="126", "Microsoft Edge WebView2";v="126"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'Telegram-Data': telegramData,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0',
   };

   const name = await getProfile(headers);
   if (name) {
      await claim(headers);
   }
}

// Main function to execute the profile and claim functions for all accounts
async function main() {
   const filePath = path.join(__dirname, 'telegram_data.txt');
   const telegramDataList = await readTelegramData(filePath);

   for (const telegramData of telegramDataList) {
      await processAccount(telegramData);
   }
}

// Function to run the main function every 30 minutes
function runEveryThirtyMinutes() {
   main();
   setInterval(main, 30 * 60 * 1000);
}

// Start the process
runEveryThirtyMinutes();
