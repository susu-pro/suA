import numpy as np
import csv
import os

def summarize_in_out(
    startdate: str = "20230210", # YYYYMMDD
    enddate: str = "20230214", # YYYYMMDD
    top_n_pairs: int = 20,
    data_dir: str = "/localhdd/Datasets/BaiduMigrationIndex_OD_update/02_by_Date/",
):
    """
    Summarize the top N cities with the most in and out traffic given a date range.
    """
    # read the csv files
    date_in_range = []
    for date_ in range(int(startdate), int(enddate) + 1):
        date_file = str(date_) + ".txt"
        try:
            with open(os.path.join(data_dir, date_file), "r") as f:
                reader = csv.DictReader(f)
                date_in_range += list(reader)
        except FileNotFoundError:
            continue

    # get paired data
    pairs = dict()
    for row in date_in_range:
        pair_id = row["pair"]
        if pair_id not in pairs:
            pairs[pair_id] = {
                "city_from": row["O"],
                "city_to": row["D"],
                "throughput": float(row["index"]),
                "pair_id": pair_id,
            }
        else:
            pairs[pair_id]["throughput"] += float(row["index"])

    # get the top N pairs with the most in and out traffic
    pairs = sorted(pairs.values(), key=lambda x: x["throughput"], reverse=True)
    top_pairs = pairs[:top_n_pairs]

    # save the top N pairs to a csv file
    output_file = os.path.join(
        os.path.dirname(__file__),
        f"{startdate[:4]}-{startdate[4:6]}-{startdate[6:8]}_{enddate[:4]}-{enddate[4:6]}-{enddate[6:8]}.csv",
    )
    with open(output_file, "w", newline="") as f:
        fieldnames = ["source", "target", "value"]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for pair in top_pairs:
            writer.writerow({
                "source": pair["city_from"],
                "target": pair["city_to"],
                "value": pair["throughput"],
            })


if __name__ == "__main__":
    holidays = [
      "春节,2020-01-24,2020-01-30",
      "春节,2021-02-11,2021-02-17",
      "中秋节,2021-09-19,2021-09-21",
      "国庆节,2021-10-01,2021-10-07",
      "春节,2022-01-31,2022-02-06",
      "中秋节,2022-09-10,2022-09-12",
      "国庆节,2022-10-01,2022-10-07",
      "元旦,2022-12-31,2023-01-02",
      "春节,2023-01-21,2023-01-27",
      "清明节,2023-04-05,2023-04-05",
      "劳动节,2023-04-29,2023-05-03",
      "端午节,2023-06-22,2023-06-24",
      "国庆节,2023-09-29,2023-10-06",
    ]
    for holiday in holidays:
        name, startdate, enddate = holiday.split(",")
        startdate = startdate.replace("-", "")
        enddate = enddate.replace("-", "")
        summarize_in_out(startdate=startdate, enddate=enddate, top_n_pairs=20)
