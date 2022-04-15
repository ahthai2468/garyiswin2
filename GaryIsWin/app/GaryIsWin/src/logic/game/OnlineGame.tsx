import { RTCSessionDescriptionType } from "react-native-webrtc";

import shared from "../../Shared";
import { Direction, User } from "../../types";
import PeerConnection from "../../utils/Networking";
import Board from "../Board";
import { Definitions } from "../TileTypes";
import Game from "./Game";

export default class OnlineGame extends Game {
  private opponent: User;
  private isHost!: boolean;
  private connection!: PeerConnection;
  private offer?: RTCSessionDescriptionType;
  onClose!: () => void;

  constructor(opponent: User, offer?: RTCSessionDescriptionType) {
    super();
    this.opponent = opponent;
    this.offer = offer;
    this.isHost = offer === undefined;
    this.connection = new PeerConnection(opponent, offer);
    if (this.isHost) {
      this.board = new Board(9);
      this.connection.onConnect = () => {
        this.connection.send(
          JSON.stringify({
            type: "init",
            seed: this.board?.seed,
          })
        );
      };
    }

    this.connection.onMessage = (data: string) => {
      console.log(`RTC received ${data}`);
      let json = JSON.parse(data);
      if (json.type === "move") {
        this.board?.move(json.dir);
      } else if (json.type === "place") {
        this.board?.place(json.x, json.y);
      } else if (json.type === "init") {
        this.board = new Board(9, 0, json.seed);
      } else if (json.type === "close") {
        this.onClose();
      }
      this.onUpdate();
    };
  }

  resetBoard() {
    if (this.isHost) {
      this.board = new Board(9);
      setTimeout(() => {
        this.connection.send(
          JSON.stringify({
            type: "init",
            seed: this.board?.seed,
          })
        );
      }, 1000);
    } else {
      if (this.board) {
        this.board.createEmptyBoard(9);
        this.board.player1WinStatus = undefined;
        this.board.player2WinStatus = undefined;
      }
    }

    this.connection.onMessage = (data: string) => {
      console.log(`RTC received ${data}`);
      let json = JSON.parse(data);
      if (json.type === "move") {
        this.board?.move(json.dir);
      } else if (json.type === "place") {
        this.board?.place(json.x, json.y);
      } else if (json.type === "init") {
        this.board = new Board(9, 0, json.seed);
      } else if (json.type === "close") {
        this.onClose();
      }
      this.onUpdate();
    };
  }

  getConnectionInfo(): [PeerConnection, RTCSessionDescriptionType?] {
    return [this.connection, this.offer];
  }

  playerNumber() {
    return this.isHost ? Definitions.player1 : Definitions.player2;
  }

  isOver() {
    return this.board?.player1WinStatus || this.board?.player2WinStatus;
  }

  isWinner() {
    let player = this.playerNumber();
    return (
      (player == Definitions.player1 && this.board?.player1WinStatus) ||
      (player == Definitions.player2 && this.board?.player2WinStatus)
    );
  }

  reset() {
    this.board = new Board(9);
  }

  isMyTurn() {
    return this.board?.currentPlayer === this.playerNumber();
  }

  turnText() {
    let playerName = this.isMyTurn()
      ? shared.currentUser!.username
      : this.opponent.username;
    return `${playerName}'s Turn`;
  }

  move(dir: Direction) {
    if (this.isMyTurn() && this.board?.move(dir)) {
      this.onUpdate();
      this.connection.send(
        JSON.stringify({
          type: "move",
          dir,
        })
      );
    }
  }

  place(x: number, y: number) {
    if (this.isMyTurn()) {
      let shape = this.board?.place(x, y);
      if (shape) {
        this.onUpdate();
        this.connection.send(
          JSON.stringify({
            type: "place",
            x,
            y,
          })
        );
      }
    }
  }

  quit() {
    this.connection.send(
      JSON.stringify({
        type: "close",
      })
    );
    this.connection.close();
    delete this.board;
    delete this.connection;
  }
}
