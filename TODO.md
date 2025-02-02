
Remonter le state :
- création d'un slot
- resizing d'un slot
ils ne peuvent pas être fait dans plusieurs day range en même temps
et il faut gérer le mouseup d'un niveau plus haut (voir même sur le body)

- créer un TimeBucket au lieu de Day, avec début et fin
  - le TimeBucket décide du comportement par exemple lorsqu'un slot dépasse la fin du jour

