// © 2024 Luxembourg Institute of Science and Technology
export type HoursOfDayCounts = {
  [key in
    | 0
    | 1
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20
    | 21
    | 22
    | 23]: number
}
