//ユーザー名を入力したか
let hasUsername = false;
//チャンネルコードを入力したか
let hasChannelCode = false;

//チャンネル一覧
const TEAM_A_SUMOU_WITCH_PLAYER = "TEAM_A_SUMOU_WITCH_PLAYER";
const TEAM_A_SUMOU_PLAYER_DATA = "TEAM_A_SUMOU_PLAYER_DATA";

//プレイヤーの定数
const PLAYER1 = 1;
const PLAYER2 = 2;
const SPECTATOR = -1;

let microBitBle;

let getData = false;

let getPlayerChannel;

let inChannel;
let outChannel;
let channelCode;

let relay;

let mdata = {
	player1_exist: false,
	player2_exist: false
};

let sending = {
	userId: "default",
	witchPlayer: SPECTATOR
};

let player;

let isWatch = false;

async function connect()
{
	if (!hasUsername || !hasChannelCode)
	{
		alert("ユーザー名とチャンネルコードの入力をしてください。");
		return;
	}

	channelCode = document.getElementById("channelCode");

	var Log = document.getElementById("log");

	Log.innerHTML = "少々お待ちください...";

	alert("micro:bitと接続してください");

	// chirimen with micro:bitの初期化
	microBitBle = await microBitBleFactory.connect();

	console.log("micro:bitとのBLE接続が完了しました。");

	Log.innerHTML = "少々お待ちください...";

	await getWitchPlayer();//プレイヤーがいるかいないかの取得

	alert("準備が整いました！");
	Log.innerHTML = `${document.getElementById("userName").value} さん、それではお楽しみください！`;

	sendingData();
}

async function getWitchPlayer()
{
	//どのプレイヤーになるかのデータを取得するための変数
	let GettingDataRelay = await RelayServer("achex", "chirimenSocket" );
	let GettingDataChannel;
	GettingDataChannel = await GettingDataRelay.subscribe(channelCode + TEAM_A_SUMOU_WITCH_PLAYER);

	GettingDataChannel.onmessage = setGetFlag;

	relay = await RelayServer("achex", "chirimenSocket" );
	inChannel = await relay.subscribe(channelCode + TEAM_A_SUMOU_WITCH_PLAYER);
	outChannel = await relay.subscribe(channelCode + TEAM_A_SUMOU_PLAYER_DATA);

	const result = await getWitchPlayerWait();

	if (!getData)//setGetFlagが呼び出されなかったとき(なにもメッセージが来なかった場合)
	{
		player = PLAYER1;
		console.log("データは来ませんでした");
	}
	
	return 0;
}

async function getWitchPlayerWait()
{
	for (let i = 0; i < 1000; i++)//データが来るまで待機
	{
		if (getData)
		{
			console.log("データが来ました");
			break;
		}
	
		if (i % 500 === 0)
		{
			console.log(i / 500);
		}
			
		await sleep(1);
	}

	return 0;
}

function clickName()
{
	if (!hasUsername)
	{
//		let text = document.getElementById("userName");
//		text.value = "";

		hasUsername = true;
	}
}
function clickChannel()
{
	if (!hasChannelCode)
	{
//		let text = document.getElementById("channelCode");
//		text.value = "";

		hasChannelCode = true;
	}
}

function setGetFlag(msg)
{
	setPlayer(msg);
}

function setPlayer(msg)
{
	getData = true;
	mdata = msg.data;

	if (player == undefined)
	{
		if (mdata.player1_exist)
		{
			player = PLAYER2;
		} else {
			player = PLAYER1;
		}
	}
}

async function sendingData()
{
	let username = document.getElementById("userName").value;
	
	while (true)
	{
		let sensorData = await microBitBle.readSensor();
		let time = new Date().toString();

		sending.userId = username;
		sending.witchPlayer = player;

		sending.sensorData = sensorData;
		sending.time = time;

		console.log(`name: ${sending.userId}\nwitchPlayer: ${sending.witchPlayer}`);

		outChannel.send(sending);

		await sleep(1000);
	}
}
