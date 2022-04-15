import {
  RTCIceCandidateType, RTCPeerConnection, RTCSessionDescriptionType
} from "react-native-webrtc";

import shared from "../Shared";
import { User } from "../types";

export default class PeerConnection {
  private pc = new RTCPeerConnection({
    iceServers: [{ url: "stun:stun.l.google.com:19302" }],
  });
  private peer: any = this.pc.createDataChannel("GaryIsWin", {
    negotiated: true,
    id: 1,
  });
  onMessage: (data: string) => void = () => {};
  onConnect: () => void = () => {};

  constructor(user: User, offer?: RTCSessionDescriptionType) {
    console.log(user);
    this.pc.onicecandidate = (event) => {
      shared.socket.emit("rtc_candidate", user.userId, event.candidate);
    };

    this.peer.onmessage = (e: any) => this.onMessage(e.data);
    this.peer.onopen = () => this.onConnect();

    shared.socket.on(
      "rtc_candidate",
      (_: any, candidate: RTCIceCandidateType) => {
        if (candidate !== undefined && candidate !== null)
          this.pc.addIceCandidate(candidate);
      }
    );

    if (offer === undefined) {
      this.pc.onnegotiationneeded = () => {
        (async () => {
          let offer = await this.pc.createOffer();
          await this.pc.setLocalDescription(offer);
          shared.socket.emit(
            "challenge_accept",
            true,
            user.userId,
            this.pc.localDescription
          );
          this.pc.onnegotiationneeded = () => {};
        })();
      };
      shared.socket.on(
        "rtc_answer",
        (_: any, answer: RTCSessionDescriptionType) => {
          this.pc.setRemoteDescription(answer);
          shared.socket.off("rtc_answer");
        }
      );
    } else {
      (async () => {
        await this.pc.setRemoteDescription(offer);
        let answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);
        shared.socket.emit("rtc_answer", user.userId, this.pc.localDescription);
      })();
    }
  }

  send(data: string) {
    this.peer.send(data);
  }

  close() {
    this.peer.close();
    this.pc.close();
    shared.socket.off("rtc_candidate");
  }
}
