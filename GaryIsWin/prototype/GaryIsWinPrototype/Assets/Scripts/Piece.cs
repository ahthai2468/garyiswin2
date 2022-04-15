using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class Piece : MonoBehaviour {
  public int x;
  public int y;
  public PieceType actualType;
  public List<PieceType> effectiveTypes;

  void Start() {
    GetComponent<RawImage>().texture = (Texture) Resources.Load("Sprites/" + actualType.ToString());
  }

  void Update() {
    transform.position = GameController.GetDrawnCoords(x, y);
  }

}

