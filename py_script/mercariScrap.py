import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from pymongo import MongoClient

while True:
    try:
        client = MongoClient()
        db = client.db_shop
        goods_doc = db.mercari
    except:
        print("Mongodb Connection Error")
        continue

    try:
        op = Options()
        op.add_argument("--start-maximized")

        url_pattern = "https://jp.mercari.com/search?category_id="

        driver = webdriver.Chrome(ChromeDriverManager().install(), options=op)
    except:
        print("Web Driver Error")
        continue

    cat_array = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 1107, 1307, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55,
                 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 70, 72, 71, 73, 75, 74, 1160, 76, 83, 77, 972, 82, 81, 79, 114, 80, 84, 85, 86, 88, 1387, 89, 87, 1263, 90, 91, 92, 93, 94, 95, 100, 862, 96, 97,
                 98, 99, 1237, 1243, 101, 102, 1183, 1172, 1139, 1153, 884, 885, 892, 104, 1216, 103, 1164, 105, 914, 106, 107, 108, 109, 110, 1097, 111, 1028, 1037, 1049, 1059, 1064, 1068, 1079, 1089, 1329, 1330, 946,
                 115, 949, 951, 116, 1108, 69, 112, 929, 113, 1256, 1151, 117, 118]
   
    for cat in cat_array:
        cat_all = url_pattern + str(cat)
        driver.get(cat_all)
        time.sleep(20)

        while True:
            try:
                li_array = driver.find_elements(
                    By.XPATH, '//*[@id="item-grid"]/ul/li')
                print("Error while reading category:", str(cat))
            except:
                continue
            if li_array != None:
                cnt = 0
                for li in li_array:
                    cnt += 1
                    try:
                        img_element = li.find_element(By.XPATH, './/img')
                        img_url = img_element.get_attribute('src')
                        print(img_url)
                    except:
                        print("Error image loading in category:", str(cat))
                        continue
                    try:
                        name_url = '//*[@id="item-grid"]/ul/li[' + \
                            str(cnt) + \
                            ']//span[@data-testid="thumbnail-item-name"]'
                        span_element = driver.find_element(By.XPATH, name_url)
                        item_name = span_element.text
                        print(item_name)
                    except:
                        print("Error while loading name in category:", str(cat))
                        continue
                    try:
                        price_url = '//*[@id="item-grid"]/ul/li[' + \
                            str(cnt) + ']//span[@class="merPrice"]/span[2]'
                        price_element = driver.find_element(
                            By.XPATH, price_url)
                        item_price = price_element.text.replace(",", "")
                        print(item_price)
                    except:
                        print("Error while loading name in price:", str(cat))
                        continue
                    try:
                        detail_url = '//*[@id="item-grid"]/ul/li[' + \
                            str(cnt) + ']//a'
                        detail_element = driver.find_element(
                            By.XPATH, detail_url)
                        item_detail = detail_element.get_attribute('href')
                        print(item_detail)
                    except:
                        print("Error while loading name in detail:", str(cat))
                        continue

                    one_record = {
                        "img_url": img_url,
                        "name": item_name,
                        "price": item_price,
                        "detail_url": item_detail,
                        "category": str(cat),
                    }

                    try:
                        existing_doc = goods_doc.find_one(one_record)
                        if existing_doc:
                            pass
                        else:
                            goods_doc.insert_one(one_record)

                    except:
                        print("Error while insert in category:", str(cat))
                        continue
            try:
                next_button = driver.find_element(
                    By.XPATH, '//*[@data-testid="pagination-next-button"]/button')
                next_button.click()
                time.sleep(10)
            except:
                break
    driver.quit()
    time.sleep(60)
