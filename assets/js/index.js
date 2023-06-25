var displayUrl;

document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
    const dropZoneElement = inputElement.closest(".drop-zone");

    dropZoneElement.addEventListener("click", (e) => {
        inputElement.click();
    });

    inputElement.addEventListener("change", (e) => {
        if (inputElement.files.length) {
            updateThumbnail(dropZoneElement, inputElement.files[0]);
        }
    });

    dropZoneElement.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZoneElement.classList.add("drop-zone--over");
    });

    ["dragleave", "dragend"].forEach((type) => {
        dropZoneElement.addEventListener(type, (e) => {
            dropZoneElement.classList.remove("drop-zone--over");
        });
    });

    dropZoneElement.addEventListener("drop", (e) => {
        e.preventDefault();

        if (e.dataTransfer.files.length) {
            inputElement.files = e.dataTransfer.files;
            updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
        }

        dropZoneElement.classList.remove("drop-zone--over");
    });

    window.addEventListener('paste', e => {
        const dropZoneElement = inputElement.closest(".drop-zone");
        updateThumbnail(dropZoneElement, e.clipboardData.files[0]);
    });
});

/**
 * Updates the thumbnail on a drop zone element.
 *
 * @param {HTMLElement} dropZoneElement
 * @param {File} file
 */
function updateThumbnail(dropZoneElement, file) {
    let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

    // First time - remove the prompt
    if (dropZoneElement.querySelector(".drop-zone__prompt")) {
        dropZoneElement.querySelector(".drop-zone__prompt").remove();
        dropZoneElement.querySelector(".default-img").remove();
    }

    // First time - there is no thumbnail element, so lets create it
    if (!thumbnailElement) {
        thumbnailElement = document.createElement("div");
        thumbnailElement.classList.add("drop-zone__thumb");
        dropZoneElement.appendChild(thumbnailElement);
    }

    thumbnailElement.dataset.label = file.name;

    // Show thumbnail for image files
    if (file.type.startsWith("image/")) {

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
        };
    }
    else {
        thumbnailElement.style.backgroundImage = null;
    }
}

function updateImage(id) {

    if (id == 1) {
        var url = 'http://localhost/assets/img/example-img/01.jpg';
    }

    if (id == 2) {
        var url = 'http://localhost/assets/img/example-img/02.jpg';
    }

    if (id == 3) {
        var url = 'http://localhost/assets/img/example-img/03.jpg';
    }

    const toDataURL = url =>
        fetch(url)
            .then(response => response.blob())
            .then(blob => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result)
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            }));

    function dataURLtoFile(dataurl, filename) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    }

    toDataURL(url).then(dataUrl => {
        var fileData = dataURLtoFile(dataUrl, "imageName.jpg");
        document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
            const dropZoneElement = inputElement.closest(".drop-zone");
            updateThumbnail(dropZoneElement, fileData);
        });
    })
}

const form = document.getElementById('submitForm');

form.addEventListener("submit", function (event) {

    event.preventDefault();

    var ocpan = $("#ocpan").prop('checked');
    var mercari = $("#mercari").prop('checked');

    if (ocpan == false && mercari == false) {
        alert('ターゲッ\u3000トサイトを選択してください!');
        return;
    }

    if ($("fileToUpload").val() == "") {
        alert('画像を選択し直してください');
        return;
    }

    if (document.getElementsByClassName('drop-zone__thumb')[0] == null) {
        alert("検索用に画像を追加してください");
        return;
    }
    console.log(mercari);
    if ($("#search_key").val() == "" && mercari == false) {

        if (!confirm("検索キーを入力しないと、検索が遅くなる可能性があります。 しかし、続行しますか？")) {
            // user clicked "Cancel" or closed the dialog
            return;
        }

    }

    var targetUrl = "";
    ocpan == true ? (targetUrl = "aucfan", displayUrl = "jp.aucfan.com") : (targetUrl = "mercari", displayUrl = "jp.mercari.com")

    const formData = new FormData();
    formData.append("fileToUpload", $('input[type=file]')[0].files[0]);
    if (ocpan == true) {
        formData.append("sub_category", $("#aucfan_sub_category").val());
    }
    else {
        formData.append("sub_category", $("#mercari_sub_category").val());
    }
    formData.append("search_key", $("#search_key").val());
    formData.append("targetUrl", targetUrl);


    $("#spinner-div").show();
    $.ajax({
        type: 'POST',
        url: "upload.php",
        data: formData,
        processData: false,
        contentType: false,

        success: function (result) {
            console.log(result);
            $("#search-rlt").html("");
            if (result.length == 0) {
                displayEmptyString();
            }
            for (let i = 0; i < result.length / 3; i++) {
                let productImageUrl = result[3 * i];
                let productDetailUrl = result[1 + 3 * i];
                let prductPrice = result[2 + 3 * i];
                makeProductCard(productImageUrl, productDetailUrl, prductPrice);
            }
        },

        error: function (error) {
            console.log(error);
            displayErrorString();
        },

        complete: function () {
            $("#spinner-div").hide();
            $("#fileUpload").val("");
            $("#default-img").attr("src", "../assets/img/img_drag.jpg");
            $("#drop-zone").css("backgroundImage", "");
        }
    });
});

function displayEmptyString() {
    $("#search-rlt").html("");
    let stateStr = $("<p>").addClass("empty_product").text("申し訳ありませんが、同様の商品が見つかりませんでした");

    $("#search-rlt").append(stateStr);
}

function displayErrorString() {
    $("#search-rlt").html("");
    let stateStr = $("<p>").addClass("error_result").text("申し訳ありませんが、検索中にエラーが検出されました");

    $("#search-rlt").append(stateStr);
}

function makeProductCard(img_url, detail_url, price) {

    var productBox = $("<div>").addClass("product-box").attr("id", "best_product");
    var imgDiv = $("<div>").addClass("img");
    var anchor = $("<a>").attr("href", detail_url).attr("target", "_blank");
    var image = $("<img>").attr("src", img_url).attr("alt", "");
    anchor.append(image);
    imgDiv.append(anchor);

    var domainDiv = $("<div>").addClass("domain");
    var domainImg = $("<img>").attr("src", "./assets/img/icon.png").attr("alt", "");
    var domainAnchor = $("<a>").attr("href", "").text(displayUrl);
    domainDiv.append(domainImg, domainAnchor);

    var priceDiv = $("<div>").addClass("price");
    var priceSpan = $("<span>").text("¥" + price);
    priceDiv.append(priceSpan);
    productBox.append(imgDiv, domainDiv, priceDiv);

    $("#search-rlt").append(productBox);
}
var mercari_category = [
    { global_cat: 1, url_pattern: 11, display_str: "トップス" },
    { global_cat: 1, url_pattern: 12, display_str: "ジャケット/アウター" },
    { global_cat: 1, url_pattern: 13, display_str: "パンツ" },
    { global_cat: 1, url_pattern: 14, display_str: "スカート" },
    { global_cat: 1, url_pattern: 15, display_str: "ワンピース" },
    { global_cat: 1, url_pattern: 16, display_str: "靴" },
    { global_cat: 1, url_pattern: 17, display_str: "ルームウェア/パジャマ" },
    { global_cat: 1, url_pattern: 18, display_str: "レッグウェア" },
    { global_cat: 1, url_pattern: 19, display_str: "帽子" },
    { global_cat: 1, url_pattern: 20, display_str: "バッグ" },
    { global_cat: 1, url_pattern: 21, display_str: "アクセサリー" },
    { global_cat: 1, url_pattern: 22, display_str: "ヘアアクセサリー" },
    { global_cat: 1, url_pattern: 23, display_str: "小物" },
    { global_cat: 1, url_pattern: 24, display_str: "時計" },
    { global_cat: 1, url_pattern: 25, display_str: "ウィッグ/エクステ" },
    { global_cat: 1, url_pattern: 26, display_str: "浴衣/水着" },
    { global_cat: 1, url_pattern: 27, display_str: "スーツ/フォーマル/ドレス" },
    { global_cat: 1, url_pattern: 28, display_str: "マタニティ" },
    { global_cat: 1, url_pattern: 29, display_str: "その他" },
    { global_cat: 2, url_pattern: 30, display_str: "トップス" },
    { global_cat: 2, url_pattern: 31, display_str: "ジャケット/アウター" },
    { global_cat: 2, url_pattern: 32, display_str: "パンツ" },
    { global_cat: 2, url_pattern: 33, display_str: "靴" },
    { global_cat: 2, url_pattern: 34, display_str: "バッグ" },
    { global_cat: 2, url_pattern: 35, display_str: "スーツ" },
    { global_cat: 2, url_pattern: 36, display_str: "帽子" },
    { global_cat: 2, url_pattern: 37, display_str: "アクセサリー" },
    { global_cat: 2, url_pattern: 38, display_str: "小物" },
    { global_cat: 2, url_pattern: 39, display_str: "時計" },
    { global_cat: 2, url_pattern: 40, display_str: "水着" },
    { global_cat: 2, url_pattern: 41, display_str: "レッグウェア" },
    { global_cat: 2, url_pattern: 42, display_str: "アンダーウェア" },
    { global_cat: 2, url_pattern: 43, display_str: "その他" },
    { global_cat: 3, url_pattern: 44, display_str: "ベビー服(女の子用)  ~95cm" },
    { global_cat: 3, url_pattern: 1107, display_str: "ベビー服(男の子用)  ~95cm" },
    { global_cat: 3, url_pattern: 1307, display_str: "ベビー服(男女兼用)  ~95cm" },
    { global_cat: 3, url_pattern: 45, display_str: "キッズ服(女の子用) 100cm~" },
    { global_cat: 3, url_pattern: 46, display_str: "キッズ服(男の子用) 100cm~" },
    { global_cat: 3, url_pattern: 47, display_str: "キッズ服(男女兼用) 100cm~" },
    { global_cat: 3, url_pattern: 48, display_str: "キッズ靴" },
    { global_cat: 3, url_pattern: 49, display_str: "子ども用ファッション小物" },
    { global_cat: 3, url_pattern: 50, display_str: "おむつ/トイレ/バス" },
    { global_cat: 3, url_pattern: 51, display_str: "外出/移動用品" },
    { global_cat: 3, url_pattern: 52, display_str: "授乳/食事" },
    { global_cat: 3, url_pattern: 53, display_str: "授乳/食事" },
    { global_cat: 3, url_pattern: 54, display_str: "おもちゃ" },
    { global_cat: 3, url_pattern: 55, display_str: "行事/記念品" },
    { global_cat: 3, url_pattern: 56, display_str: "その他" },
    { global_cat: 4, url_pattern: 57, display_str: "キッチン/食器" },
    { global_cat: 4, url_pattern: 58, display_str: "ベッド/マットレス" },
    { global_cat: 4, url_pattern: 59, display_str: "ソファ/ソファベッド" },
    { global_cat: 4, url_pattern: 60, display_str: "椅子/チェア" },
    { global_cat: 4, url_pattern: 61, display_str: "机/テーブル" },
    { global_cat: 4, url_pattern: 62, display_str: "収納家具" },
    { global_cat: 4, url_pattern: 63, display_str: "ラグ/カーペット/マット" },
    { global_cat: 4, url_pattern: 64, display_str: "カーテン/ブラインド" },
    { global_cat: 4, url_pattern: 65, display_str: "ライト/照明" },
    { global_cat: 4, url_pattern: 66, display_str: "寝具" },
    { global_cat: 4, url_pattern: 67, display_str: "インテリア小物" },
    { global_cat: 4, url_pattern: 68, display_str: "季節/年中行事" },
    { global_cat: 4, url_pattern: 70, display_str: "その他" },
    { global_cat: 5, url_pattern: 72, display_str: "本" },
    { global_cat: 5, url_pattern: 71, display_str: "漫画" },
    { global_cat: 5, url_pattern: 73, display_str: "雑誌" },
    { global_cat: 5, url_pattern: 75, display_str: "CD" },
    { global_cat: 5, url_pattern: 74, display_str: "DVD/ブルーレイ" },
    { global_cat: 5, url_pattern: 1160, display_str: "レコード" },
    { global_cat: 5, url_pattern: 76, display_str: "テレビゲーム" },
    { global_cat: 1328, url_pattern: 83, display_str: "おもちゃ" },
    { global_cat: 1328, url_pattern: 77, display_str: "タレントグッズ" },
    { global_cat: 1328, url_pattern: 972, display_str: "コミック/アニメグッズ" },
    { global_cat: 1328, url_pattern: 82, display_str: "トレーディングカード" },
    { global_cat: 1328, url_pattern: 81, display_str: "フィギュア" },
    { global_cat: 1328, url_pattern: 79, display_str: "楽器/器材" },
    { global_cat: 1328, url_pattern: 114, display_str: "コレクション" },
    { global_cat: 1328, url_pattern: 80, display_str: "ミリタリー" },
    { global_cat: 1328, url_pattern: 84, display_str: "美術品" },
    { global_cat: 1328, url_pattern: 85, display_str: "アート用品" },
    { global_cat: 1328, url_pattern: 86, display_str: "その他" },
    { global_cat: 6, url_pattern: 88, display_str: "ベースメイク" },
    { global_cat: 6, url_pattern: 1387, display_str: "メイクアップ" },
    { global_cat: 6, url_pattern: 89, display_str: "ネイルケア" },
    { global_cat: 6, url_pattern: 87, display_str: "香水" },
    { global_cat: 6, url_pattern: 1263, display_str: "スキンケア/基礎化粧品" },
    { global_cat: 6, url_pattern: 90, display_str: "ヘアケア" },
    { global_cat: 6, url_pattern: 91, display_str: "ボディケア" },
    { global_cat: 6, url_pattern: 92, display_str: "オーラルケア" },
    { global_cat: 6, url_pattern: 93, display_str: "リラクゼーション" },
    { global_cat: 6, url_pattern: 94, display_str: "ダイエット" },
    { global_cat: 6, url_pattern: 95, display_str: "その他" },
    { global_cat: 7, url_pattern: 100, display_str: "スマートフォン/携帯電話" },
    { global_cat: 7, url_pattern: 862, display_str: "スマホアクセサリー" },
    { global_cat: 7, url_pattern: 96, display_str: "PC/タブレット" },
    { global_cat: 7, url_pattern: 97, display_str: "カメラ" },
    { global_cat: 7, url_pattern: 98, display_str: "テレビ/映像機器" },
    { global_cat: 7, url_pattern: 99, display_str: "オーディオ機器" },
    { global_cat: 7, url_pattern: 1237, display_str: "美容/健康" },
    { global_cat: 7, url_pattern: 1243, display_str: "冷暖房/空調" },
    { global_cat: 7, url_pattern: 101, display_str: "生活家電" },
    { global_cat: 7, url_pattern: 102, display_str: "その他" },
    { global_cat: 8, url_pattern: 1183, display_str: "ゴルフ" },
    { global_cat: 8, url_pattern: 1172, display_str: "フィッシング" },
    { global_cat: 8, url_pattern: 1139, display_str: "自転車" },
    { global_cat: 8, url_pattern: 1153, display_str: "トレーニング/エクササイズ" },
    { global_cat: 8, url_pattern: 884, display_str: "野球" },
    { global_cat: 8, url_pattern: 885, display_str: "サッカー/フットサル" },
    { global_cat: 8, url_pattern: 892, display_str: "テニス" },
    { global_cat: 8, url_pattern: 104, display_str: "スノーボード" },
    { global_cat: 8, url_pattern: 1216, display_str: "スキー" },
    { global_cat: 8, url_pattern: 103, display_str: "その他スポーツ" },
    { global_cat: 8, url_pattern: 1164, display_str: "アウトドア" },
    { global_cat: 8, url_pattern: 105, display_str: "その他" },
    { global_cat: 9, url_pattern: 914, display_str: "アクセサリー(女性用)" },
    { global_cat: 9, url_pattern: 106, display_str: "ファッション/小物" },
    { global_cat: 9, url_pattern: 107, display_str: "アクセサリー/時計" },
    { global_cat: 9, url_pattern: 108, display_str: "日用品/インテリア" },
    { global_cat: 9, url_pattern: 109, display_str: "趣味/おもちゃ" },
    { global_cat: 9, url_pattern: 110, display_str: "キッズ/ベビー" },
    { global_cat: 9, url_pattern: 1097, display_str: "素材/材料" },
    { global_cat: 9, url_pattern: 111, display_str: "その他" },
    { global_cat: 1027, url_pattern: 1028, display_str: "音楽" },
    { global_cat: 1027, url_pattern: 1037, display_str: "スポーツ" },
    { global_cat: 1027, url_pattern: 1049, display_str: "演劇/芸能" },
    { global_cat: 1027, url_pattern: 1059, display_str: "イベント" },
    { global_cat: 1027, url_pattern: 1064, display_str: "映画" },
    { global_cat: 1027, url_pattern: 1068, display_str: "施設利用券" },
    { global_cat: 1027, url_pattern: 1079, display_str: "優待券/割引券" },
    { global_cat: 1027, url_pattern: 1089, display_str: "その他" },
    { global_cat: 1318, url_pattern: 1329, display_str: "自動車本体" },
    { global_cat: 1318, url_pattern: 1330, display_str: "自動車タイヤ/ホイール" },
    { global_cat: 1318, url_pattern: 946, display_str: "自動車パーツ" },
    { global_cat: 1318, url_pattern: 115, display_str: "自動車アクセサリー" },
    { global_cat: 1318, url_pattern: 949, display_str: "オートバイ車体" },
    { global_cat: 1318, url_pattern: 951, display_str: "オートバイパーツ" },
    { global_cat: 1318, url_pattern: 116, display_str: "オートバイアクセサリー" },
    { global_cat: 10, url_pattern: 1108, display_str: "まとめ売り" },
    { global_cat: 10, url_pattern: 69, display_str: "ペット用品" },
    { global_cat: 10, url_pattern: 112, display_str: "食品" },
    { global_cat: 10, url_pattern: 929, display_str: "飲料/酒" },
    { global_cat: 10, url_pattern: 113, display_str: "日用品/生活雑貨/旅行" },
    { global_cat: 10, url_pattern: 1256, display_str: "アンティーク/コレクション" },
    { global_cat: 10, url_pattern: 1151, display_str: "文房具/事務用品" },
    { global_cat: 10, url_pattern: 117, display_str: "事務/店舗用品" },
    { global_cat: 10, url_pattern: 118, display_str: "その他" },
];
var aucfan_category = [
    { global_cat: 1, url_pattern: 23288, display_str: "レディースファッション" },
    { global_cat: 1, url_pattern: 2084005069, display_str: "レディースバッグ" },
    { global_cat: 1, url_pattern: 23312, display_str: "婦人靴" },
    { global_cat: 1, url_pattern: 2084005204, display_str: "女性着物、着物" },
    { global_cat: 1, url_pattern: 23004, display_str: "ファッションアクセサリー" },
    { global_cat: 1, url_pattern: 23176, display_str: "メンズファッション" },
    { global_cat: 1, url_pattern: 2084006467, display_str: "メンズバッグ" },
    { global_cat: 1, url_pattern: 23200, display_str: "メンズシューズ" },
    { global_cat: 1, url_pattern: 2084005479, display_str: "男性着物、着物" },
    { global_cat: 1, url_pattern: 2084233229, display_str: "ユニセックスバッグ" },
    { global_cat: 1, url_pattern: 2084293011, display_str: "キッズ＆ベビーファッション" },
    { global_cat: 1, url_pattern: 2084061614, display_str: "着物、着物" },
    { global_cat: 1, url_pattern: 2084240597, display_str: "手作り" },
    { global_cat: 1, url_pattern: 23140, display_str: "アクセサリー、時計" },
    { global_cat: 1, url_pattern: 23802, display_str: "アウトドアウェア" },
    { global_cat: 1, url_pattern: 23008, display_str: "スポーツウェア" },
    { global_cat: 1, url_pattern: 42179, display_str: "香水、フレグランス" },
    { global_cat: 1, url_pattern: 21912, display_str: "ファッション雑誌" },
    { global_cat: 1, url_pattern: 2084062134, display_str: "コスプレ衣装" },
    { global_cat: 1, url_pattern: 2084307769, display_str: "ファッションレンタル" },

    { global_cat: 2, url_pattern: 2084052553, display_str: "ブランドアクセサリー" },
    { global_cat: 2, url_pattern: 2084005359, display_str: "レディースアクセサリー" },
    { global_cat: 2, url_pattern: 2084005358, display_str: "メンズアクセサリー" },
    { global_cat: 2, url_pattern: 2084006476, display_str: "子供用アクセサリー" },
    { global_cat: 2, url_pattern: 23260, display_str: "ブランド時計" },
    { global_cat: 2, url_pattern: 23264, display_str: "メンズ腕時計" },
    { global_cat: 2, url_pattern: 23268, display_str: "レディース腕時計" },
    { global_cat: 2, url_pattern: 23272, display_str: "ユニセックス腕時計" },
    { global_cat: 2, url_pattern: 2084024554, display_str: "キャラクターウォッチ" },
    { global_cat: 2, url_pattern: 23276, display_str: "懐中時計" },
    { global_cat: 2, url_pattern: 2084024555, display_str: "時計ストラップとバンド" },
    { global_cat: 2, url_pattern: 2084024557, display_str: "時計ケース" },
    { global_cat: 2, url_pattern: 2084024556, display_str: "時計ツール" },
    { global_cat: 2, url_pattern: 2084032117, display_str: "テーブルクリック、掛け時計" },
    { global_cat: 2, url_pattern: 2084240616, display_str: "手作り" },

    { global_cat: 3, url_pattern: 25152, display_str: "スポーツ" },
    { global_cat: 3, url_pattern: 24702, display_str: "キャンプ、アウトドア用品" },
    { global_cat: 3, url_pattern: 26222, display_str: "自転車、サイクリング" },
    { global_cat: 3, url_pattern: 25180, display_str: "釣り" },
    { global_cat: 3, url_pattern: 23008, display_str: "スポーツウェア" },
    { global_cat: 3, url_pattern: 24802, display_str: "アウトドアウェア" },
    { global_cat: 3, url_pattern: 26214, display_str: "船、ボート" },
    { global_cat: 3, url_pattern: 2084214045, display_str: "スポーツサングラス" },
    { global_cat: 3, url_pattern: 2084042420, display_str: "水遊び" },
    { global_cat: 3, url_pattern: 2084062737, display_str: "サプリメント" },
    { global_cat: 3, url_pattern: 2084042464, display_str: "旅行" },
    { global_cat: 3, url_pattern: 25430, display_str: "スポーツチケット" },
    { global_cat: 3, url_pattern: 2084044344, display_str: "レジャーチケット" },
    { global_cat: 3, url_pattern: 2084046936, display_str: "パチンコ、パチスロ" },
    { global_cat: 3, url_pattern: 2084048240, display_str: "ボートレース" },
    { global_cat: 3, url_pattern: 25407, display_str: "競馬" },
    { global_cat: 3, url_pattern: 2084048304, display_str: "自転車レース" },
    { global_cat: 3, url_pattern: 24534, display_str: "ペット用品" },
    { global_cat: 3, url_pattern: 26086, display_str: "花、ガーデニング" },
    { global_cat: 3, url_pattern: 2084307762, display_str: "スポーツ用品レンタル" },

    { global_cat: 4, url_pattern: 23880, display_str: "ビデオ機器" },
    { global_cat: 4, url_pattern: 6523764, display_str: "オーディオ機器" },
    { global_cat: 4, url_pattern: 23636, display_str: "カメラ、光学機器" },
    { global_cat: 4, url_pattern: 23960, display_str: "携帯電話、スマートフォン" },
    { global_cat: 4, url_pattern: 2084316074, display_str: "スマートウォッチ、ウェアラブルデバイス" },
    { global_cat: 4, url_pattern: 2084008364, display_str: "キッチン、ダイニングテーブル" },
    { global_cat: 4, url_pattern: 2084042675, display_str: "洗濯、アイロン" },
    { global_cat: 4, url_pattern: 24450, display_str: "クリーニング" },
    { global_cat: 4, url_pattern: 2084008356, display_str: "冷暖房" },
    { global_cat: 4, url_pattern: 2084042673, display_str: "美容、健康" },
    { global_cat: 4, url_pattern: 2084042672, display_str: "電話、ファックス" },
    { global_cat: 4, url_pattern: 2084042480, display_str: "OA機器" },
    { global_cat: 4, url_pattern: 2084050527, display_str: "電子辞書" },
    { global_cat: 4, url_pattern: 23878, display_str: "電卓" },
    { global_cat: 4, url_pattern: 2084044953, display_str: "セル、バッテリー、充電器" },
    { global_cat: 4, url_pattern: 2084263358, display_str: "電子部品" },
    { global_cat: 4, url_pattern: 22844, display_str: "ビデオゲーム" },
    { global_cat: 4, url_pattern: 23336, display_str: "コンピュータ周辺機器" },
    { global_cat: 4, url_pattern: 24466, display_str: "家庭用電化製品" },
    { global_cat: 4, url_pattern: 24690, display_str: "照明器具" },
    { global_cat: 4, url_pattern: 2084213062, display_str: "時計" },
    { global_cat: 4, url_pattern: 23761, display_str: "アマチュア無線" },

    { global_cat: 5, url_pattern: 2084039759, display_str: "コンピューター" },
    { global_cat: 5, url_pattern: 2084292086, display_str: "タブレット" },
    { global_cat: 5, url_pattern: 2084005067, display_str: "スマートフォン、携帯電話" },
    { global_cat: 5, url_pattern: 2084261633, display_str: "デジタルカメラ" },
    { global_cat: 5, url_pattern: 2084039561, display_str: "周辺機器" },
    { global_cat: 5, url_pattern: 23568, display_str: "ソフトウェア" },
    { global_cat: 5, url_pattern: 2084039461, display_str: "供給" },
    { global_cat: 5, url_pattern: 2084039480, display_str: "部品" },
    { global_cat: 5, url_pattern: 2084049588, display_str: "サーバー" },
    { global_cat: 5, url_pattern: 23560, display_str: "ワークステーション" },
    { global_cat: 5, url_pattern: 23557, display_str: "PDA" },
    { global_cat: 5, url_pattern: 2084048038, display_str: "コンピューターデスク" },
    { global_cat: 5, url_pattern: 21908, display_str: "コンピュータ、インターネットマガジン" },
    { global_cat: 5, url_pattern: 21700, display_str: "コンピューター、インターネットブック" },

    { global_cat: 6, url_pattern: 22844, display_str: "ビデオゲーム" },
    { global_cat: 6, url_pattern: 25826, display_str: "トレーディングカードゲーム" },
    { global_cat: 6, url_pattern: 25888, display_str: "図" },
    { global_cat: 6, url_pattern: 2084250263, display_str: "プラモデル" },
    { global_cat: 6, url_pattern: 2084251269, display_str: "トイラジコン" },
    { global_cat: 6, url_pattern: 2084251212, display_str: "ホビーラジコン" },
    { global_cat: 6, url_pattern: 2084260113, display_str: "ミニカー" },
    { global_cat: 6, url_pattern: 2084259630, display_str: "スロットカー" },
    { global_cat: 6, url_pattern: 2084259579, display_str: "鉄道模型" },
    { global_cat: 6, url_pattern: 2084259623, display_str: "プラレール" },
    { global_cat: 6, url_pattern: 2084005573, display_str: "おもちゃの銃" },
    { global_cat: 6, url_pattern: 27673, display_str: "ヴィンテージ" },
    { global_cat: 6, url_pattern: 2084044370, display_str: "ヒーローごっこ、戦闘" },
    { global_cat: 6, url_pattern: 2084044371, display_str: "ヒロイン、ファッションプレイ" },
    { global_cat: 6, url_pattern: 25864, display_str: "人形、キャラクタードール" },
    { global_cat: 6, url_pattern: 40494, display_str: "ぬいぐるみ" },
    { global_cat: 6, url_pattern: 26077, display_str: "キャラクタートイ" },
    { global_cat: 6, url_pattern: 26018, display_str: "パズル" },
    { global_cat: 6, url_pattern: 27727, display_str: "ゲーム" },
    { global_cat: 6, url_pattern: 24382, display_str: "手品、パーティーグッズ" },
    { global_cat: 6, url_pattern: 40510, display_str: "ブロック、積み木" },
    { global_cat: 6, url_pattern: 2084007247, display_str: "赤ちゃん用" },
    { global_cat: 6, url_pattern: 2084024190, display_str: "乗用玩具" },
    { global_cat: 6, url_pattern: 2084024146, display_str: "知育玩具" },

    { global_cat: 7, url_pattern: 22436, display_str: "楽器、機器" },
    { global_cat: 7, url_pattern: 20056, display_str: "芸術作品" },
    { global_cat: 7, url_pattern: 20124, display_str: "画材" },
    { global_cat: 7, url_pattern: 20924, display_str: "手工芸品、手工芸品" },
    { global_cat: 7, url_pattern: 20428, display_str: "軍事" },
    { global_cat: 7, url_pattern: 25888, display_str: "図" },
    { global_cat: 7, url_pattern: 2084251269, display_str: "トイラジコン" },
    { global_cat: 7, url_pattern: 2084250263, display_str: "プラモデル" },
    { global_cat: 7, url_pattern: 2084251212, display_str: "ホビーラジコン" },
    { global_cat: 7, url_pattern: 2084260113, display_str: "ミニカー" },
    { global_cat: 7, url_pattern: 2084259579, display_str: "鉄道模型" },
    { global_cat: 7, url_pattern: 2084063789, display_str: "模型製作用品" },
    { global_cat: 7, url_pattern: 27753, display_str: "鉄道" },
    { global_cat: 7, url_pattern: 26186, display_str: "航空機" },
    { global_cat: 7, url_pattern: 23761, display_str: "アマチュア無線" },
    { global_cat: 7, url_pattern: 2084046936, display_str: "パチンコ、パチスロ" },

    { global_cat: 8, url_pattern: 2084024008, display_str: "クラフト" },
    { global_cat: 8, url_pattern: 20056, display_str: "芸術作品" },
    { global_cat: 8, url_pattern: 2084236067, display_str: "家具" },
    { global_cat: 8, url_pattern: 2084259484, display_str: "鎧" },
    { global_cat: 8, url_pattern: 20960, display_str: "切手、ポストカード" },
    { global_cat: 8, url_pattern: 20452, display_str: "お金" },
    { global_cat: 8, url_pattern: 20116, display_str: "印刷物" },
    { global_cat: 8, url_pattern: 20992, display_str: "トレーディングカード" },
    { global_cat: 8, url_pattern: 27771, display_str: "広告・ノベルティグッズ" },
    { global_cat: 8, url_pattern: 20764, display_str: "科学、自然" },
    { global_cat: 8, url_pattern: 20004, display_str: "電気製品" },
    { global_cat: 8, url_pattern: 2084048439, display_str: "蓄音機" },
    { global_cat: 8, url_pattern: 21060, display_str: "車両" },
    { global_cat: 8, url_pattern: 27858, display_str: "ディズニー" },
    { global_cat: 8, url_pattern: 2084005574, display_str: "ボーナス" },
    { global_cat: 8, url_pattern: 42223, display_str: "サイエンス フィクション" },
    { global_cat: 8, url_pattern: 2084045612, display_str: "ボトルキャップ" },
    { global_cat: 8, url_pattern: 27856, display_str: "サイン" },
    { global_cat: 8, url_pattern: 21152, display_str: "雑貨" },
    { global_cat: 8, url_pattern: 27673, display_str: "おもちゃ、ゲーム" },
    { global_cat: 8, url_pattern: 23968, display_str: "テレホンカード" },
    { global_cat: 8, url_pattern: 25888, display_str: "図" },
    { global_cat: 8, url_pattern: 20428, display_str: "軍事" },

    { global_cat: 9, url_pattern: 21636, display_str: "漫画、コミック" },
    { global_cat: 9, url_pattern: 21884, display_str: "雑誌" },
    { global_cat: 9, url_pattern: 2084008525, display_str: "文学、小説" },
    { global_cat: 9, url_pattern: 2084008550, display_str: "ノンフィクション、教育" },
    { global_cat: 9, url_pattern: 21740, display_str: "地図、旅行ガイド" },
    { global_cat: 9, url_pattern: 2084008861, display_str: "趣味、スポーツ、実用" },
    { global_cat: 9, url_pattern: 2084008935, display_str: "住まい・暮らし・子育て" },
    { global_cat: 9, url_pattern: 21712, display_str: "学習、教育" },
    { global_cat: 9, url_pattern: 21624, display_str: "児童書、絵本" },
    { global_cat: 9, url_pattern: 21700, display_str: "コンピューターとインターネット" },
    { global_cat: 9, url_pattern: 21820, display_str: "自然科学と技術" },
    { global_cat: 9, url_pattern: 2084008989, display_str: "健康と医学" },
    { global_cat: 9, url_pattern: 2084009036, display_str: "アート、エンターテイメント" },
    { global_cat: 9, url_pattern: 2084008755, display_str: "ビジネス、経済" },
    { global_cat: 9, url_pattern: 2084008565, display_str: "人文、社会" },
    { global_cat: 9, url_pattern: 2084263670, display_str: "古書、古文書" },
    { global_cat: 9, url_pattern: 20072, display_str: "カレンダー" },
    { global_cat: 9, url_pattern: 26156, display_str: "大人" },

    { global_cat: 10, url_pattern: 22192, display_str: "CD" },
    { global_cat: 10, url_pattern: 22260, display_str: "レコード" },
    { global_cat: 10, url_pattern: 22344, display_str: "カセットテープ" },
    { global_cat: 10, url_pattern: 2084046929, display_str: "DVD" },
    { global_cat: 10, url_pattern: 2084249081, display_str: "ブルーレイ" },
    { global_cat: 10, url_pattern: 22244, display_str: "ビデオ" },
    { global_cat: 10, url_pattern: 2084005202, display_str: "レーザーディスク" },
    { global_cat: 10, url_pattern: 2084224176, display_str: "SPボード" },
    { global_cat: 10, url_pattern: 22436, display_str: "楽器、機器" },
    { global_cat: 10, url_pattern: 2084044331, display_str: "バウチャー、チケット" },
    { global_cat: 10, url_pattern: 21788, display_str: "本、雑誌" },
    { global_cat: 10, url_pattern: 22396, display_str: "お土産、記念品" },

    { global_cat: 11, url_pattern: 21968, display_str: "DVD" },
    { global_cat: 11, url_pattern: 2084239338, display_str: "ブルーレイ" },
    { global_cat: 11, url_pattern: 2084005503, display_str: "VCD" },
    { global_cat: 11, url_pattern: 22072, display_str: "ビデオテープ" },
    { global_cat: 11, url_pattern: 22020, display_str: "レーザーディスク" },
    { global_cat: 11, url_pattern: 2084042367, display_str: "映画サウンドトラック" },
    { global_cat: 11, url_pattern: 22124, display_str: "映画関連グッズ" },
    { global_cat: 11, url_pattern: 2084039789, display_str: "チケット" },

    { global_cat: 12, url_pattern: 2084062134, display_str: "コスプレ衣装" },
    { global_cat: 12, url_pattern: 2084000109, display_str: "勤務先" },
    { global_cat: 12, url_pattern: 2084005356, display_str: "セル" },
    { global_cat: 12, url_pattern: 25888, display_str: "図" },
    { global_cat: 12, url_pattern: 2084250334, display_str: "プラモデル" },
    { global_cat: 12, url_pattern: 21636, display_str: "コミックブック" },
    { global_cat: 12, url_pattern: 21976, display_str: "DVD" },
    { global_cat: 12, url_pattern: 22080, display_str: "ビデオ" },
    { global_cat: 12, url_pattern: 2084005149, display_str: "ミスック CD" },
    { global_cat: 12, url_pattern: 2084006158, display_str: "カレンダー" },
    { global_cat: 12, url_pattern: 21020, display_str: "トレーディングカード" },
    { global_cat: 12, url_pattern: 2084005120, display_str: "テレホンカード" },
    { global_cat: 12, url_pattern: 2084006184, display_str: "ポスター" },

    { global_cat: 13, url_pattern: 2084047071, display_str: "人、グループ" },
    { global_cat: 13, url_pattern: 2084008066, display_str: "雑誌" },
    { global_cat: 13, url_pattern: 2084009038, display_str: "タレントブック" },
    { global_cat: 13, url_pattern: 22748, display_str: "チケット" },
    { global_cat: 13, url_pattern: 2084005109, display_str: "テレホンカード" },
    { global_cat: 13, url_pattern: 2084006042, display_str: "トレーディングカード" },
    { global_cat: 13, url_pattern: 2084006183, display_str: "ポスター" },
    { global_cat: 13, url_pattern: 22396, display_str: "ミュージシャングッズ" },

    { global_cat: 14, url_pattern: 42168, display_str: "キッチン、食器" },
    { global_cat: 14, url_pattern: 42160, display_str: "家庭用品" },
    { global_cat: 14, url_pattern: 2084288099, display_str: "ストレージ" },
    { global_cat: 14, url_pattern: 24230, display_str: "家具、インテリア" },
    { global_cat: 14, url_pattern: 2084240626, display_str: "ハンドメイド作品" },
    { global_cat: 14, url_pattern: 24642, display_str: "工具・DIY用品" },
    { global_cat: 14, url_pattern: 2084042017, display_str: "商業用建材" },
    { global_cat: 14, url_pattern: 24466, display_str: "電化製品" },
    { global_cat: 14, url_pattern: 2084047969, display_str: "防災・セキュリティ" },
    { global_cat: 14, url_pattern: 20284, display_str: "季節、年中行事" },
    { global_cat: 14, url_pattern: 2084061209, display_str: "冠婚葬祭" },
    { global_cat: 14, url_pattern: 2084059849, display_str: "仏壇・仏具" },
    { global_cat: 14, url_pattern: 24534, display_str: "ペット用品" },
    { global_cat: 14, url_pattern: 2084048832, display_str: "害虫駆除、防虫剤" },

    { global_cat: 15, url_pattern: 2084042481, display_str: "店舗用品" },
    { global_cat: 15, url_pattern: 2084042480, display_str: "OA機器" },
    { global_cat: 15, url_pattern: 22920, display_str: "デスクトップアクセサリー" },
    { global_cat: 15, url_pattern: 2084047365, display_str: "ラッピング、包装" },
    { global_cat: 15, url_pattern: 2084042484, display_str: "静止した" },
    { global_cat: 15, url_pattern: 2084246780, display_str: "名刺入れ、カードケース" },
    { global_cat: 15, url_pattern: 22904, display_str: "バッグ、スーツケース" },
    { global_cat: 15, url_pattern: 21620, display_str: "ビジネス書" },
    { global_cat: 15, url_pattern: 2084307793, display_str: "事務・店舗用品レンタル" },

    { global_cat: 16, url_pattern: 208420087, display_str: "農業" },
    { global_cat: 16, url_pattern: 2084006704, display_str: "ガーデニング" },
    { global_cat: 16, url_pattern: 2084006711, display_str: "アレンジメント" },
    { global_cat: 16, url_pattern: 2084006710, display_str: "切り花、花束" },
    { global_cat: 16, url_pattern: 2084048020, display_str: "盆栽" },
    { global_cat: 16, url_pattern: 2084048017, display_str: "観葉植物" },
    { global_cat: 16, url_pattern: 2084006709, display_str: "鉢植え" },
    { global_cat: 16, url_pattern: 2084006708, display_str: "ドライフラワー" },
    { global_cat: 16, url_pattern: 2084047125, display_str: "リース" },
    { global_cat: 16, url_pattern: 20840067705, display_str: "人工的な花" },

    { global_cat: 17, url_pattern: 32180, display_str: "化粧品、スキンケア" },
    { global_cat: 17, url_pattern: 42179, display_str: "香水、フレグランス" },
    { global_cat: 17, url_pattern: 2084005298, display_str: "ネイルケア" },
    { global_cat: 17, url_pattern: 2084005297, display_str: "ヘアケア" },
    { global_cat: 17, url_pattern: 2084007425, display_str: "ボディケア" },
    { global_cat: 17, url_pattern: 2084055379, display_str: "オーラルケア" },
    { global_cat: 17, url_pattern: 2084012478, display_str: "メガネ、コンタクト" },
    { global_cat: 17, url_pattern: 2084042539, display_str: "リラックスグッズ" },
    { global_cat: 17, url_pattern: 26100, display_str: "ダイエット" },
    { global_cat: 17, url_pattern: 24054, display_str: "健康食品" },
    { global_cat: 17, url_pattern: 2084042538, display_str: "介護・介護用品" },
    { global_cat: 17, url_pattern: 24854, display_str: "応急処置・衛生用品" },
    { global_cat: 17, url_pattern: 2084042544, display_str: "健康グッズ、健康器具" },
    { global_cat: 17, url_pattern: 2084007477, display_str: "美容機器" },

    { global_cat: 18, url_pattern: 2084042546, display_str: "おむつ、トイレ用品" },
    { global_cat: 18, url_pattern: 2084007247, display_str: "おもちゃ" },
    { global_cat: 18, url_pattern: 2084008387, display_str: "安全用品" },
    { global_cat: 18, url_pattern: 2084008379, display_str: "お風呂・バスグッズ" },
    { global_cat: 18, url_pattern: 2084008393, display_str: "ベビー家具" },
    { global_cat: 18, url_pattern: 24210, display_str: "ベビー服、マタニティウェア" },

    { global_cat: 19, url_pattern: 2084005796, display_str: "シーフード" },
    { global_cat: 19, url_pattern: 2084005795, display_str: "肉" },
    { global_cat: 19, url_pattern: 2084006748, display_str: "米、穀物、シリアル" },
    { global_cat: 19, url_pattern: 2084006751, display_str: "野菜、果物" },
    { global_cat: 19, url_pattern: 42164, display_str: "飲料" },
    { global_cat: 19, url_pattern: 24054, display_str: "健康食品" },
    { global_cat: 19, url_pattern: 2084006888, display_str: "ダイエット食品" },
    { global_cat: 19, url_pattern: 208404279, display_str: "加工食品" },
    { global_cat: 19, url_pattern: 23982, display_str: "菓子、デザート" },
    { global_cat: 19, url_pattern: 2084006750, display_str: "パスタ、麺類" },
    { global_cat: 19, url_pattern: 2084049724, display_str: "パン" },
    { global_cat: 19, url_pattern: 24034, display_str: "卵、乳製品" },
    { global_cat: 19, url_pattern: 24042, display_str: "調味料、スパイス" },
    { global_cat: 19, url_pattern: 24050, display_str: "品揃え" },
    { global_cat: 19, url_pattern: 2084008374, display_str: "牛乳、離乳食" },
    { global_cat: 19, url_pattern: 21704, display_str: "レシピブック" },

    { global_cat: 20, url_pattern: 2084055861, display_str: "魚、水生生物" },
    { global_cat: 20, url_pattern: 2084055856, display_str: "爬虫類" },
    { global_cat: 20, url_pattern: 2084055845, display_str: "両生類" },
    { global_cat: 20, url_pattern: 24534, display_str: "ペット用品" },

    { global_cat: 21, url_pattern: 2084044330, display_str: "ジャンル別" },
    { global_cat: 21, url_pattern: 22748, display_str: "チケット売り場" },
    { global_cat: 21, url_pattern: 2084048817, display_str: "優待券・割引クーポン" },
    { global_cat: 21, url_pattern: 2084044317, display_str: "施設利用券" },
    { global_cat: 21, url_pattern: 26178, display_str: "トレイルチケット、交通チケット" },
    { global_cat: 21, url_pattern: 2084006752, display_str: "ギフト券" },
    { global_cat: 21, url_pattern: 2084007688, display_str: "プリペイドカード" },
    { global_cat: 21, url_pattern: 2084062636, display_str: "ホテルの予約" },
];

// for (let cnt = 0; cnt < mercari_category.length; cnt++) {
//     if (mercari_category[cnt]["global_cat"] == 1) {
//         const init_option = $('<option>').text(mercari_category[cnt]["display_str"]).val(mercari_category[cnt]["url_pattern"]);
//         $("#mercari_sub_category").append(init_option);
//     }
// }

for (let cnt = 0; cnt < aucfan_category.length; cnt++) {
    if (aucfan_category[cnt]["global_cat"] == 1) {
        const init_option = $('<option>').text(aucfan_category[cnt]["display_str"]).val(aucfan_category[cnt]["url_pattern"]);
        $("#aucfan_sub_category").append(init_option);
    }
}

const radios = document.querySelectorAll('input[type="radio"]');
radios.forEach(radio => {
    radio.addEventListener('change', (event) => {
        if (event.target.id == "ocpan") {
            // $("#mercari_category").hide();
            $("#aucfan_category").show();
        }
        else if (event.target.id == "mercari") {
            // $("#mercari_category").show();
            $("#aucfan_category").hide();
        }
    });
});

// $("#aucfan_category").css("display", "none");
$("#mercari_category").css("display", "none");


// $("#mercari_global_category").on('change', function (event) {

//     let glo_cat = event.target.value;

//     $("#mercari_sub_category").html("");
//     for (let i = 0; i < mercari_category.length; i++) {
//         if (mercari_category[i]["global_cat"] == glo_cat) {
//             const new_option = $('<option>').text(mercari_category[i]["display_str"]).val(mercari_category[i]["url_pattern"]);
//             $("#mercari_sub_category").append(new_option);
//         }
//     }
// });

$("#aucfan_global_category").on('change', function (event) {

    let glo_cat = event.target.value;
    $("#aucfan_sub_category").html("");
    for (let i = 0; i < aucfan_category.length; i++) {
        if (aucfan_category[i]["global_cat"] == glo_cat) {
            const new_option = $('<option>').text(aucfan_category[i]["display_str"]).val(aucfan_category[i]["url_pattern"]);
            $("#aucfan_sub_category").append(new_option);
        }
    }
});

