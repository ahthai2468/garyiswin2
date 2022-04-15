using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class GameController : MonoBehaviour {
  PieceType curplayer = PieceType.Davin;
  int state = 0;
  public Text statetext;
  public Text turntext;
  public PieceType curplace;
  public Text wintext;
  List<PieceType> LabelTypes = new List<PieceType>{
    PieceType.CircleLabel,
    PieceType.SquareLabel,
    PieceType.StarLabel,
    PieceType.TriangleLabel,
    PieceType.Player1Label,
    PieceType.Player2Label,
    PieceType.Davin,
    PieceType.Gary,
    PieceType.Win,
    PieceType.Kill,
    PieceType.Stop,
    PieceType.Push
  };

  List<PieceType> DescriptorLabels = new List<PieceType>{
    PieceType.Davin,
    PieceType.Gary,
    PieceType.Win,
    PieceType.Kill,
    PieceType.Stop,
    PieceType.Push
  };

  List<PieceType> ObjectLabels = new List<PieceType>{
    PieceType.CircleLabel,
    PieceType.SquareLabel,
    PieceType.StarLabel,
    PieceType.TriangleLabel,
    PieceType.Player1Label,
    PieceType.Player2Label,
  };

  List<PieceType> ObjectTypes = new List<PieceType>{
    PieceType.Player1,
    PieceType.Player2,
    PieceType.Circle,
    PieceType.Square,
    PieceType.Star,
    PieceType.Triangle,
  };

  List<PieceType> Spawnable = new List<PieceType>{
    PieceType.Circle,
    PieceType.Square,
    PieceType.Star,
    PieceType.Triangle,
  };

  List<List<PieceType>> equalities;

  void Start() {
    DrawGrid();
    InitPlayers();
    InitLabels();
    CheckEqualities();
  }

  void Update() {
    turntext.text = curplayer.ToString() + " is moving";
    if (state == 0) {
      if(Input.GetMouseButtonDown(0)) {
        Vector2Int pos = GetRealCoords(Input.mousePosition);
        if (pos.x >= 0 && pos.x < Constants.GRID_SIZE && pos.y >= 0 && pos.y < Constants.GRID_SIZE) {
          MakePiece(pos.x, pos.y, curplace);
          MoveMade();
        }
      }
      statetext.text = "Placing: " + curplace.ToString();
    }
      
    if (state >= 1) {
      statetext.text = "Moving: " + (4 - state) + " moves left";
      if (Input.GetKeyDown(KeyCode.LeftArrow)) {
        Move(-1, 0);
      }
      if (Input.GetKeyDown(KeyCode.RightArrow)) {
        Move(1, 0);
      }
      if (Input.GetKeyDown(KeyCode.UpArrow)) {
        Move(0, 1);
      }
      if (Input.GetKeyDown(KeyCode.DownArrow)) {
        Move(0, -1);
      }
    }
  }

  public void Reset() {
    SceneManager.LoadScene(0);
  }

  void DrawGrid() {
    GameObject background = GameObject.Find("Background");
    GameObject gridUnit = (GameObject) Resources.Load("Prefabs/GridUnit");
    for (int x = 0; x < Constants.GRID_SIZE; x++) {
      for (int y = 0; y < Constants.GRID_SIZE; y++) {
        GameObject unit = Instantiate(gridUnit);
        unit.transform.parent = background.transform;
        unit.transform.position = GetDrawnCoords(x, y);
        ((RectTransform) unit.transform).sizeDelta = new Vector2(Constants.UNIT_SIZE * Constants.UNIT_RATIO, 
          Constants.UNIT_SIZE * Constants.UNIT_RATIO);
      }
    }
  }
  void InitPlayers() {
    MakePiece(1, 1, PieceType.Player1);
    MakePiece(7, 7, PieceType.Player2);
  }

  // TODO: Make random
  void InitLabels() {
    MakePiece(3, 4, PieceType.CircleLabel);
    MakePiece(3, 1, PieceType.TriangleLabel);
    MakePiece(4, 7, PieceType.SquareLabel);
    MakePiece(2, 0, PieceType.StarLabel);
    MakePiece(4, 3, PieceType.Win);
    MakePiece(6, 2, PieceType.Kill);
    MakePiece(3, 3, PieceType.Stop);
    MakePiece(3, 7, PieceType.Push);
    MakePiece(0, 0, PieceType.Davin);
    MakePiece(0, 1, PieceType.Player1Label);
    MakePiece(Constants.GRID_SIZE - 1, Constants.GRID_SIZE - 1, PieceType.Gary);
    MakePiece(Constants.GRID_SIZE - 1, Constants.GRID_SIZE - 2, PieceType.Player2Label);
  }
  
  // if space has no pushable or stop, and is in bounds
  public bool SpaceEmpty(int x, int y) {
    if (x < 0 || y < 0 || x >= Constants.GRID_SIZE || y >= Constants.GRID_SIZE) {
      return false;
    }

    List<Piece> at = GetPiecesAt(x, y);

    List<Piece> stop = getObjectsFittingDescriptor(PieceType.Stop);
    List<Piece> push = getObjectsFittingDescriptor(PieceType.Push);
    foreach(Piece p in at) {
      if (stop.Contains(p)) {
        return false;
      }
      if (push.Contains(p)) {
        return false;
      }
      if (LabelTypes.Contains(p.actualType)) {
        return false;
      }
    }
    return true;
  }

  public Piece ContainsPushable(int x, int y) {
    if (x < 0 || y < 0 || x >= Constants.GRID_SIZE || y >= Constants.GRID_SIZE) {
      return null;
    }

    List<Piece> at = GetPiecesAt(x, y);

    List<Piece> push = getObjectsFittingDescriptor(PieceType.Push);
    foreach(Piece p in at) {
      if (push.Contains(p)) {
        return p;
      }
      if (LabelTypes.Contains(p.actualType)) {
        return p;
      }
    }
    return null;
  }

  public List<Piece> GetPiecesAt(int x, int y, bool debug = false) {
    List<Piece> result = new List<Piece>();
    foreach(Piece p in GetPieces()) {
      if(p.x == x && p.y == y) {
        result.Add(p);
      }
    }
    return result;
  }

  public GameObject MakePiece(int x, int y, PieceType type) {
    Piece piece = Instantiate((GameObject) Resources.Load("Prefabs/Piece")).GetComponent<Piece>();
    piece.x = x;
    piece.y = y;
    piece.actualType = type;
    piece.transform.parent = transform;
    ((RectTransform) piece.transform).sizeDelta = new Vector2(Constants.UNIT_SIZE * Constants.UNIT_RATIO, 
      Constants.UNIT_SIZE * Constants.UNIT_RATIO);
    return piece.gameObject;
  }

  public static Vector2 GetDrawnCoords(int x, int y) {
    return GetDrawnCoords((float) x, (float) y);
  }

  public static Vector2 GetDrawnCoords(float x, float y) {
    return new Vector2(Constants.UNIT_SIZE + x * Constants.UNIT_SIZE,
                                      Constants.UNIT_SIZE + y * Constants.UNIT_SIZE);
  }

  public static Vector2Int GetRealCoords(Vector3 coords) {
    Vector2Int res = new Vector2Int((int) Mathf.Round((coords.x - Constants.UNIT_SIZE) / Constants.UNIT_SIZE),
                          (int) Mathf.Round((coords.y - Constants.UNIT_SIZE) / Constants.UNIT_SIZE));
    return res;
  }

  void ClearEqualities() {
    equalities = new List<List<PieceType>>();
    foreach (PieceType piece in LabelTypes) {
      equalities.Add(new List<PieceType>{piece});
    }
    // clear visuals
    foreach (GameObject obj in GameObject.FindGameObjectsWithTag("is")) {
      Destroy(obj);
    }
  }

  void CheckEqualities() {
    ClearEqualities();

    // Update Visuals
    GameObject[] lmao = GameObject.FindGameObjectsWithTag("Piece");
    List<Piece> pieces = new List<Piece>();
    foreach (GameObject g in lmao) {
      Piece toadd = g.GetComponent<Piece>();
      if (LabelTypes.Contains(toadd.actualType)) {
        pieces.Add(toadd);
      }
    }
    foreach (Piece piece in pieces) {
      foreach (Piece neighbor in pieces) {
        if (piece != neighbor) {
          int diffX = neighbor.x - piece.x;
          int diffY = neighbor.y - piece.y;
          if (Mathf.Abs(diffX) + Mathf.Abs(diffY) == 1) {
            DrawIs(piece.x, piece.y, neighbor.x, neighbor.y);

            // Update equalities
            List<PieceType> l1 = getEqList(piece.actualType);
            List<PieceType> l2 = getEqList(neighbor.actualType);
            if ( l1 != l2 ) {
              l1.AddRange(l2);
              equalities.Remove(l2);
            }
          }
        }
      }
    }

    List<PieceType> winlist = getEqList(PieceType.Win);
    List<PieceType> loselist = getEqList(PieceType.Kill);

    // If player is win/lose
    if(winlist.Contains(PieceType.Davin)) {
      wintext.text = "Davin is win!";
    }

    if(winlist.Contains(PieceType.Gary)) {
      wintext.text = "Gary is win!";
    }

    if(loselist.Contains(PieceType.Davin)) {
      wintext.text = "Davin is lose :(";
    }

    if(loselist.Contains(PieceType.Gary)) {
      wintext.text = "Gary is win :)";
    }

    // If player is on win/lose
    foreach (Piece davin in getObjectsFittingDescriptor(PieceType.Davin)) {
      foreach (Piece piece in GetPiecesAt(davin.x, davin.y)) {
        if (winlist.Contains(objectToLabel(piece.actualType))) {
          wintext.text = "Davin is win!";
        }
        if (loselist.Contains(objectToLabel(piece.actualType))) {
          wintext.text = "Davin is lose :(";
        }
      }
    }

    foreach (Piece gary in getObjectsFittingDescriptor(PieceType.Gary)) {
      foreach (Piece piece in GetPiecesAt(gary.x, gary.y)) {
        if (winlist.Contains(objectToLabel(piece.actualType))) {
          wintext.text = "Gary is win!";
        }
        if (loselist.Contains(objectToLabel(piece.actualType))) {
          wintext.text = "Gary is lose :(";
        }
      }
    }
  }

  // Gets other types that are equal to type
  List<PieceType> getEqList(PieceType type) {
    foreach (List<PieceType> l in equalities) {
      foreach (PieceType t in l) {
        if (t == type) {
          return l;
        } 
      }
    }
    return null;
  }

  // Gets all pieces that have descriptor type
  List<Piece> getObjectsFittingDescriptor(PieceType type) {
    foreach (List<PieceType> l in equalities) {
      foreach (PieceType t in l) {
        if (t == type) {
          List<PieceType> objectTypes = new List<PieceType>();

          foreach (PieceType toadd in l) {
            if (ObjectLabels.Contains(toadd)) {
              objectTypes.Add(labelToObject(toadd));
            }
          }

          List<Piece> objects = new List<Piece>();
          foreach (PieceType otype in objectTypes) {
            objects.AddRange(GetPiecesWithActualType(otype));
          }
          return objects;
        } 
      }
    }
    return null;
  }

  // Gets all pieces whose actual type is type
  List<Piece> GetPiecesWithActualType(PieceType type) {
    List<Piece> result = new List<Piece>();
    foreach (GameObject obj in GameObject.FindGameObjectsWithTag("Piece")) {
      Piece p = obj.GetComponent<Piece>();
      if (p.actualType == type) {
        result.Add(p);
      }
    }
    return result;
  }

  // Get all pieces
  List<Piece> GetPieces() {
    List<Piece> result = new List<Piece>();
    foreach (GameObject obj in GameObject.FindGameObjectsWithTag("Piece")) {
      Piece p = obj.GetComponent<Piece>();
      result.Add(p);
    }
    return result;
  }

  void DrawIs(int x1, int y1, int x2, int y2) {
    float x = (x1 + x2) / 2f;
    float y = (y1 + y2) / 2f;
    GameObject obj = Instantiate((GameObject) Resources.Load("Prefabs/is"));
    obj.transform.position = GetDrawnCoords(x, y);
    obj.transform.parent = transform;
    ((RectTransform) obj.transform).sizeDelta = new Vector2(Constants.UNIT_SIZE * Constants.UNIT_RATIO, 
      Constants.UNIT_SIZE * Constants.UNIT_RATIO);
  }

  void SwitchPlayer() {
    if(curplayer == PieceType.Davin) {
      curplayer = PieceType.Gary;
    } else {
      curplayer = PieceType.Davin;
    }
  }

  void MoveMade() {
    CheckEqualities();
    state++;
    if(state == 4) {
      state = 0;
      SwitchPlayer();
    }
    curplace = Spawnable[Random.Range(0, Spawnable.Count)];
  }

  void Move(int dx, int dy) {
      List<Piece> players = getObjectsFittingDescriptor(curplayer);
      foreach (Piece player in players) {
        if(SpaceEmpty(player.x + dx, player.y + dy)) {
          player.x += dx;
          player.y += dy;
        } else if (ContainsPushable(player.x + dx, player.y + dy) != null && SpaceEmpty(player.x + dx * 2, player.y + dy * 2)) {
          ContainsPushable(player.x + dx, player.y + dy).x += dx;
          ContainsPushable(player.x + dx, player.y + dy).y += dy;
          player.x += dx;
          player.y += dy;
        }
      }
      MoveMade();
  }

  PieceType labelToObject(PieceType label) {
    if (ObjectLabels.Contains(label)) {
      switch (label) {
        case PieceType.CircleLabel:
          return PieceType.Circle;
        case PieceType.SquareLabel:
          return PieceType.Square;
        case PieceType.TriangleLabel:
          return PieceType.Triangle;
        case PieceType.StarLabel:
          return PieceType.Star;
        case PieceType.Player1Label:
          return PieceType.Player1;
        case PieceType.Player2Label:
          return PieceType.Player2;
      }
    }
    return PieceType.Circle;
  }

  PieceType objectToLabel(PieceType label) {
    if (ObjectTypes.Contains(label)) {
      switch (label) {
        case PieceType.Circle:
          return PieceType.CircleLabel;
        case PieceType.Square:
          return PieceType.SquareLabel;
        case PieceType.Triangle:
          return PieceType.TriangleLabel;
        case PieceType.Star:
          return PieceType.StarLabel;
        case PieceType.Player1:
          return PieceType.Player1Label;
        case PieceType.Player2:
          return PieceType.Player2Label;
      }
    }
    return PieceType.Player2Label;
  }

}

public enum PieceType {
  Circle,
  Square,
  Star,
  Triangle,
  Player1,
  Player2,
  CircleLabel,
  SquareLabel,
  StarLabel,
  TriangleLabel,
  Player1Label,
  Player2Label,
  Davin,
  Gary,
  Win,
  Kill,
  Stop,
  Push
}
