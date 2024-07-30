require('dotenv').config();
const fs = require('fs').promises;
const puppeteer = require('puppeteer');

async function loginAndScrape() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  const domail_list_page_url = process.env.BASE_URL + 'DomainsList.php?sid=';
  const login_page_url = process.env.BASE_URL + 'Login.php';
  const top_page_url = process.env.BASE_URL + 'SiteSelect.php';
  const output_file_header = 'SiteID\tSiteName\tURL\tFrom\tDNS\tSPF\tDKIM\n';
  const output_file = 'scraped_data.tsv';
  // ファイルを空にしてHeaderを追加する
  fs.writeFile(output_file, output_file_header, { encoding: 'utf-8' });


  try {
    // ログイン
    await page.goto(login_page_url);
    await page.type('input[name="user_name"]', process.env.USER_NAME);
    await page.type('input[name="user_passwd"]', process.env.USER_PASSWORD);
    page.click('.login-button');
    await page.waitForNavigation();

    ///////////////// 各サイトのURLをメニュー一覧から取得 /////////////////
    await page.goto(top_page_url);

    // メニューリンクを抽出
    const sites = await page.$$eval('.category_link', async (elements) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const sites = elements.map((el) => {
        return {
          text: el.innerText,
          href: el.getAttribute('href')
        };
      });

      return sites;
    });


    //////////////繰り返し処理開始/////////////
    for (const site of sites) {

      let site_name = site.text;
      let site_url = site.href;
      let sid = new URL(site_url).searchParams.get('sid');
      console.log('sid:', sid);

      ///////////////// 各サイトデータ取得 /////////////////

      await page.goto(domail_list_page_url + sid);

      const elementTexts = await page.$$eval('.list-table.child tbody tr', async (elements) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return elements.map(el => {
          const from = el.querySelector('td:nth-child(2)');
          const dnsImg = el.querySelector('td:nth-child(3) img');
          const spfImg = el.querySelector('td:nth-child(4) img');
          const dkimImg = el.querySelector('td:nth-child(5) img');

          return {
            from: from ? from.innerText : null,
            dns: dnsImg ? dnsImg.getAttribute('src') : null,
            spf: spfImg ? spfImg.getAttribute('src') : null,
            dkim: dkimImg ? dkimImg.getAttribute('src') : null
          };
        });
      });

      console.log('elementTexts: ', elementTexts);

      // データをタブ区切りのテキストに変換
      let rows = elementTexts.map(item =>
        `${sid}\t${site_name}\t${site_url}\t${item.from}\t${item.dns}\t${item.spf}\t${item.dkim}`
      ).join('\n');
      rows = rows + '\n';

      // 書き込み
      await fs.appendFile('scraped_data.tsv', rows);
      
      //テスト用。サイト負荷を気にして全件取得させない。
      //if(sid >= 9) break;

      ///////////////// 各サイトデータ取得 /////////////////

    };
    //////////////繰り返し処理終了/////////////

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await browser.close();
  }
}

loginAndScrape();
