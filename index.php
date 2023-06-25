<!DOCTYPE html>
<html lang="jp">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="keywords" content="画像検索システム, オークファン, メルカリ">
    <meta name="description" content="オークファンとメルカリで画像検索を行うシステムです。">
    <title>画像検索システム</title>

    <!-- Main Style -->
    <link rel="stylesheet" href="./assets/css/main.css">

    <link rel="icon" type="image/x-icon" href="./assets/img/favicon.png">

    <!-- Fontawesome CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

    <!-- Jquery Js -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
</head>

<body>
    <div id="wrapper">
        <div class="container">
            <h1>画像検索システム</h1>
            <form class="search-form" action = "upload.php" method="post" enctype="multipart/form-data" id="submitForm">
                <div>
                    <div class="box">
                        <div class="drop-zone" id="drop-zone">
                            <img src="./assets/img/img_drag.jpg" alt="" class="default-img" id="default-img">
                            <span class="drop-zone__prompt">ここに画像をドラッグするか、<br>ファイルをコピーします。</span>
                            <input type="file" id="fileUpload" name="myFile" class="drop-zone__input" accept="image/png, image/jpeg">
                        </div>
                    </div>
                    <div class="condition">
                        <div class="form-group">
                            <input type="radio" name="sitecheck" id="ocpan" checked="true">
                            <label for="ocpan">オークファンで検索</label>
                        </div>
                        <div class="form-group">
                            <input type="radio" name="sitecheck" id="mercari" >
                            <label for="mercari">メルカリで検索</label>
                        </div>
                        <div class="">
                            <div class="select-div" id = "mercari_category">
                                <select class="select-form" type="text" id="mercari_global_category" name="">
                                    <option value="1">レディース</option>
                                    <option value="2">メンズ</option>
                                    <option value="3">ベビー・キッズ</option>
                                    <option value="4">インテリア・住まい・小物</option>
                                    <option value="5">本・音楽・ゲーム</option>
                                    <option value="1328">おもちゃ・ホビー・グッズ</option>
                                    <option value="6">コスメ・香水・美容</option>
                                    <option value="7">家電・スマホ・カメラ</option>
                                    <option value="8">スポーツ・レジャー</option>
                                    <option value="9">ハンドメイド</option>
                                    <option value="1027">チケット</option>
                                    <option value="1318">自動車・オートバイ</option>
                                    <option value="10">その他</option>
                                </select>
                                <select class="select-form" type="text" id="mercari_sub_category" name="">
                                </select>
                            </div>
                            <div class="select-div" id = "aucfan_category">
                                <select class="select-form" type="text" id="aucfan_global_category" name="">
                                    <option value="1">ファッション</option>
                                    <option value="2">アクセサリー、時計</option>
                                    <option value="3">スポーツ、レジャー</option>
                                    <option value="4">家電製品、AVカメラ</option>
                                    <option value="5">コンピューター</option>
                                    <option value="6">おもちゃ、ゲーム</option>
                                    <option value="7">趣味、文化</option>
                                    <option value="8">アンティークコレクション</option>
                                    <option value="9">本、雑誌、コミック</option>
                                    <option value="10">音楽、CD</option>
                                    <option value="11">映画、ビデオ、DVD</option>
                                    <option value="12">コミック、アニメグッズ</option>
                                    <option value="13">タレントグッズ</option>
                                    <option value="14">家、インテリア、DIY</option>
                                    <option value="15">事務用品、店舗用品</option>
                                    <option value="16">花、ガーデニング、農業</option>
                                    <option value="17">美容、ヘルスケア</option>
                                    <option value="18">ベビー用品</option>
                                    <option value="19">食料と飲料</option>
                                    <option value="20">ペット、生き物</option>
                                    <option value="21">チケット、バウチャー ホテル予約</option>
                                </select>
                                <select class="select-form" type="text" id="aucfan_sub_category" name="">
                                </select>
                                <div class="select-div">
                                    <input placeholder="キーワード" type="text" id="search_key" name="" />
                                    <p>10年間のすべての商品</p>
                                </div>
                            </div>
                            <div class="form-group" name="sitecheck">
                                <input placeholder="キーワード" type="text" id="search_key" name="" />
                                
                            </div>
                        </div>
                        <div class="no-img-text">
                            <p>画像無し？</p>
                            <p>次のいずれかを試してください。</p>
                        </div>
                        <div class="example-img">
                            <a href="javascript:;updateImage(1)">
                                <img src="./assets/img/example-img/01.jpg" alt="" id="default-img01">
                            </a>
                            <a href="javascript:;updateImage(2)">
                                <img src="./assets/img/example-img/02.jpg" alt="" id="default-img02">
                            </a>
                            <a href="javascript:;updateImage(3)">
                                <img src="./assets/img/example-img/03.jpg" alt="" id="default-img03">
                            </a>
                        </div>
                        <hr>
                        <div class="search-btn">
                            <button type = "submit" >
                                <i class="fa fa-search"></i> 検 索
                            </button>
                        </div>
                    </div>
                </div>
            </form>
            <h1>検 索 結 果</h1>
            <section id="search-rlt">
                
            </section>
            </div>
        </div>

        <!-- spinner -->
        <div id="spinner-div" class="spinner-box">
            <div class="spinner"></div>
        </div>

    <!-- Main Js -->
    <script src="./assets/js/index.js"></script>
</body>

</html>