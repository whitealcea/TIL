import sha256 from "sha256";

/**
 * 取引情報
 */
class Transaction {
    /**送り主のアドレス */
    senderAddress: string | null;
    /** 受け取り主のアドレス */
    recipientAddress: string;
    /** 金額 */
    amount: number;

    /**
     * コンストラクタ
     * @param senderAddress 送り主のアドレス
     * @param recipientAddress 受け取り主のアドレス
     * @param amount 金額
     */
    constructor(senderAddress: string | null, recipientAddress: string, amount: number) {
        this.senderAddress = senderAddress;
        this.recipientAddress = recipientAddress;
        this.amount = amount;
    }
}

/**
 * ブロック
 */
class Block {
    timestamp: string;
    transactions: Transaction[];
    prevHash: string;
    hash: string;
    nonce: number;

    constructor(timestamp: string, transactions: Transaction[], prevHash: string) {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.prevHash = prevHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash(): string {
        const hash = sha256(
            this.prevHash +
            this.timestamp +
            JSON.stringify(this.transactions) +
            this.nonce
        ).toString();
        return hash;
    }

    mineBlock() {
        while (this.hash.substring(0, 2) !== '00') {
            this.nonce++;
            this.hash = this.calculateHash();

        }
        console.log(`ブロックがマイニングされました：${this.hash}`);
    }
}

class Blockchain {
    chain: Block[];
    pendingTransactions: Transaction[];
    miningReword: number;

    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];
        this.miningReword = 12.5;
    }

    createGenesisBlock() {
        return new Block(Date.now().toString(), [], "0");
    }

    getLatestBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    createTransaction(transaction: Transaction) {
        this.pendingTransactions.push(transaction);
    }

    minePendingTransactions(miningRewordAddress: string) {
        const block = new Block(Date.now().toString(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock();

        console.log('ブロックが正常にマイニングされました');

        this.chain.push(block);

        this.pendingTransactions = [new Transaction(null, miningRewordAddress, this.miningReword)];
    }

    getBalanceOfAddress(address: string): number {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.senderAddress === address) {
                    balance -= trans.amount;
                }
                if (trans.recipientAddress === address) {
                    balance += trans.amount;
                }
            }
        }
        return balance;

    }

}

const originalCoin = new Blockchain();

originalCoin.createTransaction(new Transaction(null, 'your-address', 12.5));
originalCoin.createTransaction(new Transaction('address1', 'your-address', 10));
originalCoin.createTransaction(new Transaction('your-address', 'address2', 2));

console.log('\n マイニングを開始');
originalCoin.minePendingTransactions('your-address');

console.log('\n あなたのアドレスの残高は', originalCoin.getBalanceOfAddress('your-address'));

console.log('\n マイニングを再度実行');
originalCoin.minePendingTransactions('your-address');

console.log('\n あなたのアドレスの残高は', originalCoin.getBalanceOfAddress('your-address'));
