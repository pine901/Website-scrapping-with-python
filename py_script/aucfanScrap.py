import time
import re
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from pymongo import MongoClient

while True:
    try:
        client = MongoClient()
        db = client.db_shop
        goods_doc = db.aucfan
    except:
        print("Mongodb Connection Error")
        continue

    try:
        op = Options()
        op.add_argument("--start-maximized")

        url_pattern = "https://auctions.yahoo.co.jp/category/list/"
        driver = webdriver.Chrome(ChromeDriverManager().install(), options=op)
    except:
        print("Web Driver Error")
        continue

    cat_array = [20992, 2084007425, 22020, 23557, 2084047365, 23560, 2084233229, 23568, 2084062737, 27673, 2084061209, 21020, 2084008989, 2084044317, 20004, 2084044330, 2084044331, 26156, 2084063789, 40494, 2084007477, 2084048439, 2084044344, 22072, 40510, 25152, 22080, 24642, 2084006467, 21060, 26178, 2084052553, 26186, 2084006476, 2084251212, 2084008525, 2084039759, 27727, 2084009036, 2084044370, 2084044371, 23636, 2084046929, 2084009038, 2084046936, 20056, 25180, 2084050527, 2084047969, 2084288099, 23140, 26214, 2084005479, 2084008550, 27753, 20072, 22124, 2084039789, 26222, 24690, 21620, 2084032117, 2084008565, 21624, 20840067705, 27771, 24702, 2084005503, 2084042367, 2084008066, 21636, 2084251269, 23176, 2084048017, 24210, 20116, 2084048020, 2084250263, 2084044953, 2084006042, 20124, 2084259484, 23200, 21152, 2084048038, 24230, 22192, 2084224176, 42160, 2084042420, 2084049588, 42164, 42168, 42179, 21700, 2084005573, 2084005574, 2084024008, 2084059849, 21704, 2084005067, 2084005069, 27856, 23761, 27858, 21712, 23764, 2084240597, 23260, 22748, 2084250334, 2084047071, 23264, 2084042464, 24802, 25826, 23268, 22244, 23272, 2084240616, 2084024554, 2084024555, 23276, 2084024557, 2084024556, 42223, 2084042480, 21740, 2084240626, 2084042481, 22260, 2084005109, 2084263670, 2084042484, 23288, 208420087, 23802, 2084259579,
                 2084246780, 2084005120, 2084261633, 25864, 2084007688, 2084006158, 23312, 2084260113, 2084047125, 24854, 20764, 2084214045, 21788, 2084005149, 25888, 2084042017, 2084236067, 2084039461, 2084055845, 2084259623, 23336, 2084006184, 2084006183, 2084042539, 2084045612, 2084042538, 2084259630, 2084006704, 2084042544, 2084307762, 2084008755, 2084006708, 2084006709, 2084006710, 2084006711, 2084039480, 2084307769, 2084042546, 208404279, 22844, 21820, 24382, 25407, 20284, 2084049724, 23878, 2084213062, 23880, 22344, 2084055856, 2084007247, 2084307793, 2084024146, 2084005202, 2084005204, 2084055379, 25430, 2084006748, 2084006750, 2084006751, 2084006752, 2084055861, 2084000109, 2084048240, 22904, 21884, 22396, 2084024190, 24450, 22920, 2084039561, 22928, 24466, 2084293011, 21908, 21912, 23960, 2084008861, 23968, 26018, 2084005795, 2084008356, 22436, 2084005796, 2084316074, 2084008364, 2084062636, 2084061614, 23982, 2084048304, 2084042673, 2084042672, 2084042675, 32180, 2084005298, 2084062134, 2084005297, 2084008374, 2084048817, 2084008379, 20924, 2084263358, 2084012478, 2084048832, 2084008387, 2084008393, 20428, 21968, 24534, 21976, 23004, 26077, 23008, 20960, 24034, 20452, 26086, 2084008935, 2084006888, 2084239338, 24042, 2084005356, 2084005358, 2084005359, 24050, 26100, 2084292086, 24054, 2084249081]
    for cat in cat_array:
        cat_all = url_pattern + str(cat) + "/"
        driver.get(cat_all)
        time.sleep(5)

        while True:
            try:
                li_array = driver.find_elements(
                    By.XPATH, '//*[@class="Products__list"]/ul/li')
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
                        name_element = li.find_element(By.XPATH, ".//div[@class='Product__detail']/h3/a")
                        item_name = name_element.text
                        print(item_name)
                    except:
                        print("Error while loading name in category:", str(cat))
                        continue
                    try:
                        price_element = li.find_element(
                            By.XPATH, ".//div[@class='Product__detail']/div[@class='Product__priceInfo']/span[1]/span[2]")
                        item_price = price_element.text.replace(",", "")
                        item_price = re.search(r'\d+', item_price)
                        if item_price:
                            item_price = item_price.group()
                        print(item_price)
                    except:
                        print("Error while loading name in price:", str(cat))
                        continue
                    try:
                        detail_element = li.find_element(
                            By.XPATH, ".//div[1]/a")
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
                    By.XPATH, '//*[@class="Pager__list Pager__list--next"]/a')
                next_button.click()
                time.sleep(5)
            except:
                break
    driver.quit()            
    time.sleep(60)
