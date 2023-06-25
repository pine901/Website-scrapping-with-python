# import required libraries
import cv2
import numpy as np
import urllib.request
from skimage.metrics import structural_similarity as compare_ssim
from multiprocessing import Pool
import concurrent.futures
import pymongo
import sys

MAX_BEST_NUM = 5
MIN_BOUND_SCORE = 0.55


def likeness_images(record, img1):

    try:
        img_url = record["img_url"]
        # Download the image and save it as a NumPy array
        with urllib.request.urlopen(img_url) as url_response:
            img_array = np.array(
                bytearray(url_response.read()), dtype=np.uint8)

        # Decode the NumPy array into an image using OpenCV
        img2 = cv2.imdecode(img_array, -1)

        if img1 is not None:
            # Convert the image to grayscale
            img1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
        else:
            sys.exit(0)
        # convert the images to grayscale

        if img2 is not None:
            # Convert the image to grayscale
            img2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)
        else:
            # print('Error: Failed to load image')
            sys.exit(1)

            # Resize img1 to match the size of img2
        if img1.shape != img2.shape:
            img1 = cv2.resize(img1, (img2.shape[1], img2.shape[0]))

        # Compute the SSIM score between the two grayscale images
        (similarity, diff) = compare_ssim(img1, img2, full=True)

        result = {
            "data": record,
            "score": similarity
        }
        return result
    except:
        return {
            "data": "",
            "score": 0
        }


# load the input images
img1 = cv2.imread(sys.argv[1])


url_pattern = sys.argv[2]
search_key = ""
if (len(sys.argv) == 4):
    search_key = sys.argv[3]

client = pymongo.MongoClient("mongodb://localhost:27017")
db = client["db_shop"]
collection = db["mercari"]

url_array = []
if (search_key == ""):
    records = collection.find({"category": url_pattern})
else:
    records = collection.find(
        {"category": url_pattern, "name": {"$regex": search_key}})

# Create a thread pool with a maximum of 100 threads
pool = concurrent.futures.ThreadPoolExecutor(max_workers=800)

# Submit 100 tasks to the thread pool
futures = []
for record in records:
    futures.append(pool.submit(likeness_images, record, img1))

# Get the return values of all completed tasks
results = [future.result()
           for future in concurrent.futures.as_completed(futures)]

sorted_result = sorted(results, key=lambda x: x["score"], reverse=True)[
    :MAX_BEST_NUM]
for best in sorted_result:
    if (best["score"] > MIN_BOUND_SCORE):
        # result_json = json.dumps(best)
        print(best["data"]["img_url"])
        print(best["data"]["detail_url"])
        # print(best["data"]["name"])
        print(best["data"]["price"])
