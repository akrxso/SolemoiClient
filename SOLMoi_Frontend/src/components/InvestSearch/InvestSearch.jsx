"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./InvestSearch.css";
import game from "../../assets/images/game.png";
import stock from "../../assets/images/stock.png";
import home from "../../assets/images/home.png";

const formatNumber = (num) => new Intl.NumberFormat("ko-KR").format(num || 0);

const formatPercent = (num) =>
  new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(num || 0);

export default function InvestSearch() {
  const navigate = useNavigate();
  const [stockData, setStockData] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const timeoutRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/allstock");
      if (!response.ok) {
        throw new Error("Failed to fetch stock data");
      }
      const { data } = await response.json();
      setStockData(data || []); // 전체 데이터를 갱신
      // 검색 결과 유지: 검색 중이라면 필터링 유지
      if (searchQuery.trim()) {
        const filtered = data.filter(
          (stock) =>
            stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            stock.symbol
              .toString()
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        );
        setFilteredStocks(filtered);
      } else {
        setFilteredStocks(data);
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(() => {
      setIsUpdating(true);
      fetchData();
      timeoutRef.current = setTimeout(() => setIsUpdating(false), 60);
    }, 1000); // 1초마다 갱신

    return () => {
      clearInterval(intervalId);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [fetchData]);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    const filtered = stockData.filter(
      (stock) =>
        stock.name.toLowerCase().includes(query.toLowerCase()) ||
        stock.symbol.toString().toLowerCase().includes(query.toLowerCase())
    );

    setFilteredStocks(filtered);
  };

  return (
    <div className="containerMock">
      {/* Header */}
      <div className={`balanceSection ${isUpdating ? "updating" : ""}`}>
        <input
          type="text"
          placeholder="종목명 또는 코드로 검색하세요"
          value={searchQuery}
          onChange={handleSearch}
          className="searchInput"
        />
      </div>

      {/* Stocks Section */}
      <div className="stocksSection">
        <h2 className="sectionTitle">주식 리스트</h2>
        {isLoading ? (
          <div className="loadingMessage">로딩 중...</div>
        ) : (
          <div className="stocksList">
            {filteredStocks.map((stock) => (
              <div
                key={stock.stock_id}
                className={`stockItem ${isUpdating ? "updating" : ""}`}
              >
                <div className="stockInfo">
                  <div className="logoContainer">
                    <div className="logo">{stock.name.charAt(0)}</div>
                  </div>
                  <div>
                    <div className="stockName">{stock.name}</div>
                    <div className="stockCode">{stock.symbol}</div>
                  </div>
                </div>
                <div className="stockPriceInfo">
                  <div className="currentPrice">
                    {formatNumber(stock.current_price)}원
                  </div>
                  <div
                    className={
                      stock.price_change >= 0
                        ? "priceChangePositive"
                        : "priceChangeNegative"
                    }
                  >
                    {stock.price_change >= 0 ? "+" : ""}
                    {formatNumber(stock.price_change)}원 (
                    {formatPercent(
                      (stock.price_change /
                        (stock.current_price - stock.price_change)) *
                        100
                    )}
                    %)
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <footer className="bottomNav">
          <div className="navItems">
            <div className="navItem" onClick={() => navigate("/stock")}>
              <img src={home} alt="home" className="navImagehome" />
            </div>
            <div className="navItem activeNavItem">
              <img src={stock} alt="stock" className="navImage" />
            </div>
            <div
              className="navItem"
              onClick={() => navigate("/solleafcontent")}
            >
              <img src={game} alt="game" className="navImage" />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
