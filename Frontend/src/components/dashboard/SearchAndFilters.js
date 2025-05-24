import React from 'react';

const SearchAndFilters = ({
  searchQuery,
  setSearchQuery,
  yearFilter,
  setYearFilter,
  companyCodeFilter,
  setCompanyCodeFilter,
  assemblyCodeFilter,
  setAssemblyCodeFilter,
  companies,
  assemblyCodes,
  isSearching,
  years
}) => {
  return (
    <div className="flex-1 flex items-center gap-4">
      <div className="relative w-full md:w-96">
        <input
          type="text"
          placeholder="Search files & folders"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-300 transition-all"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="p-3 border border-gray-300 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-300 transition-all"
        >
          <option value="">Filter by Year</option>
          {years.map((yearOption) => (
            <option key={yearOption} value={yearOption}>
              {yearOption}
            </option>
          ))}
        </select>
        <select
          value={companyCodeFilter}
          onChange={(e) => setCompanyCodeFilter(e.target.value)}
          className="p-3 border border-gray-300 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-300 transition-all"
        >
          <option value="">Filter by Company Code</option>
          {companies.map((company) => (
            <option key={company.code} value={company.code}>
              {company.code} - {company.name}
            </option>
          ))}
        </select>
        <select
          value={assemblyCodeFilter}
          onChange={(e) => setAssemblyCodeFilter(e.target.value)}
          className="p-3 border border-gray-300 rounded-xl shadow-inner focus:ring-2 focus:ring-blue-300 transition-all"
        >
          <option value="">Filter by Assembly Code</option>
          {assemblyCodes.map((assembly) => (
            <option key={assembly.code} value={assembly.code}>
              {assembly.code} - {assembly.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SearchAndFilters; 